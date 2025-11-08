package main

import (
	"encoding/json"
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"strconv"
)

type TypeDesc struct {
	Kind   string               `json:"kind"`
	Strict *bool                `json:"strict,omitempty"`
	Props  map[string]*TypeDesc `json:"props,omitempty"`
	Mapped *TypeDesc            `json:"mapped,omitempty"`
	Elem   *TypeDesc            `json:"elem,omitempty"`
	Deref  *bool                `json:"deref,omitempty"`
}

func boolPtr(b bool) *bool { return &b }

func identName(e ast.Expr) string {
	switch t := e.(type) {
	case *ast.Ident:
		return t.Name
	case *ast.SelectorExpr:
		// pkg.Ident -> use the final name
		return t.Sel.Name
	default:
		return ""
	}
}

func parsePrimitiveFromIdent(name string) *TypeDesc {
	switch name {
	case "StringType":
		return &TypeDesc{Kind: "string"}
	case "NumberType":
		return &TypeDesc{Kind: "number"}
	case "BoolType":
		return &TypeDesc{Kind: "bool"}
	case "AnyType":
		return &TypeDesc{Kind: "any"}
	case "NullType":
		return &TypeDesc{Kind: "null"}
	default:
		return nil
	}
}

func parseMapLiteralProps(lit *ast.CompositeLit) map[string]*TypeDesc {
	props := map[string]*TypeDesc{}
	for _, elt := range lit.Elts {
		kv, ok := elt.(*ast.KeyValueExpr)
		if !ok {
			continue
		}
		key, ok := kv.Key.(*ast.BasicLit)
		if !ok || key.Kind != token.STRING {
			continue
		}
		name, err := strconv.Unquote(key.Value)
		if err != nil {
			continue
		}
		props[name] = parseTypeExpr(kv.Value)
	}
	return props
}

func parseObjectFromConstructor(fun string, call *ast.CallExpr) *TypeDesc {
	switch fun {
	case "NewStrictObjectType":
		if len(call.Args) == 1 {
			if mlit, ok := call.Args[0].(*ast.CompositeLit); ok {
				return &TypeDesc{
					Kind:   "object",
					Strict: boolPtr(true),
					Props:  parseMapLiteralProps(mlit),
				}
			}
		}
		return &TypeDesc{Kind: "object", Strict: boolPtr(true), Props: map[string]*TypeDesc{}}
	case "NewObjectType":
		if len(call.Args) == 1 {
			if mlit, ok := call.Args[0].(*ast.CompositeLit); ok {
				return &TypeDesc{
					Kind:   "object",
					Strict: boolPtr(false),
					Props:  parseMapLiteralProps(mlit),
				}
			}
		}
		return &TypeDesc{Kind: "object", Strict: boolPtr(false), Props: map[string]*TypeDesc{}}
	case "NewEmptyObjectType":
		return &TypeDesc{Kind: "object", Strict: boolPtr(false), Props: map[string]*TypeDesc{}}
	case "NewEmptyStrictObjectType":
		return &TypeDesc{Kind: "object", Strict: boolPtr(true), Props: map[string]*TypeDesc{}}
	case "NewMapObjectType":
		// Object with dynamic keys mapped to the given type
		var mapped *TypeDesc
		if len(call.Args) == 1 {
			mapped = parseTypeExpr(call.Args[0])
		}
		return &TypeDesc{Kind: "object", Strict: boolPtr(false), Props: map[string]*TypeDesc{}, Mapped: mapped}
	default:
		return nil
	}
}

func parseTypeExpr(e ast.Expr) *TypeDesc {
	switch t := e.(type) {
	case *ast.CompositeLit:
		// Handle primitives like StringType{}, NumberType{}, BoolType{}, AnyType{}, NullType{}
		if name := identName(t.Type); name != "" {
			if prim := parsePrimitiveFromIdent(name); prim != nil {
				return prim
			}
			// ArrayType or ObjectType composite literal not expected in BuiltinGlobalVariableTypes.
			// Fallback to any if unknown.
			return &TypeDesc{Kind: "any"}
		}
		return &TypeDesc{Kind: "any"}
	case *ast.CallExpr:
		if name := identName(t.Fun); name != "" {
			if obj := parseObjectFromConstructor(name, t); obj != nil {
				return obj
			}
		}
		return &TypeDesc{Kind: "any"}
	case *ast.UnaryExpr:
		// Handle pointer literals like &ArrayType{...} if ever present
		return parseTypeExpr(t.X)
	default:
		// Ident may appear without composite literal in some styles (rare here)
		if id := identName(t); id != "" {
			if prim := parsePrimitiveFromIdent(id); prim != nil {
				return prim
			}
		}
		return &TypeDesc{Kind: "any"}
	}
}

func extractBuiltinGlobalVariableTypes(filePath string) (map[string]*TypeDesc, error) {
	fset := token.NewFileSet()
	astFile, err := parser.ParseFile(fset, filePath, nil, parser.ParseComments)
	if err != nil {
		return nil, fmt.Errorf("parse error: %w", err)
	}

	for _, decl := range astFile.Decls {
		gen, ok := decl.(*ast.GenDecl)
		if !ok || gen.Tok != token.VAR {
			continue
		}
		for _, spec := range gen.Specs {
			vs, ok := spec.(*ast.ValueSpec)
			if !ok {
				continue
			}
			for i, name := range vs.Names {
				if name.Name != "BuiltinGlobalVariableTypes" {
					continue
				}
				if len(vs.Values) <= i {
					continue
				}
				// Expect a map literal: map[string]ExprType{ ... }
				cl, ok := vs.Values[i].(*ast.CompositeLit)
				if !ok {
					return nil, fmt.Errorf("BuiltinGlobalVariableTypes is not a composite literal")
				}
				result := map[string]*TypeDesc{}
				for _, elt := range cl.Elts {
					kv, ok := elt.(*ast.KeyValueExpr)
					if !ok {
						continue
					}
					k, ok := kv.Key.(*ast.BasicLit)
					if !ok || k.Kind != token.STRING {
						continue
					}
					key, err := strconv.Unquote(k.Value)
					if err != nil {
						continue
					}
					result[key] = parseTypeExpr(kv.Value)
				}
				return result, nil
			}
		}
	}
	return nil, fmt.Errorf("BuiltinGlobalVariableTypes not found")
}

func main() {
	// Resolve absolute path to the actionlint semantics file
	cwd, _ := os.Getwd()
	target := filepath.Join(cwd, "scripts", "actionlint", "expr_sema.go")
	outPath := filepath.Join(cwd, "scripts", "actionlint", "builtin-global-variable-types.json")

	m, err := extractBuiltinGlobalVariableTypes(target)
	if err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}

	// Ensure directory exists
	if err := os.MkdirAll(filepath.Dir(outPath), 0o755); err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}

	f, err := os.Create(outPath)
	if err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}
	defer f.Close()

	enc := json.NewEncoder(f)
	enc.SetIndent("", "  ")
	if err := enc.Encode(m); err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}
}
