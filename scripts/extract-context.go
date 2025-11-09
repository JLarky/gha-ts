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
	Doc    string               `json:"doc,omitempty"`
	DocURLs []string            `json:"docUrls,omitempty"`
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

func parseBoolIdent(e ast.Expr) (bool, bool) {
	if id, ok := e.(*ast.Ident); ok {
		if id.Name == "true" {
			return true, true
		}
		if id.Name == "false" {
			return false, true
		}
	}
	return false, false
}

type commentHelper struct {
	fset     *token.FileSet
	comments []*ast.CommentGroup
}

func parseMapLiteralProps(lit *ast.CompositeLit, h *commentHelper) map[string]*TypeDesc {
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
		td := parseTypeExpr(kv.Value, h)
		props[name] = td
	}
	return props
}

func parseArrayTypeFromComposite(lit *ast.CompositeLit, h *commentHelper) *TypeDesc {
	desc := &TypeDesc{Kind: "array"}
	// keyed fields
	for _, elt := range lit.Elts {
		switch v := elt.(type) {
		case *ast.KeyValueExpr:
			if key, ok := v.Key.(*ast.Ident); ok {
				switch key.Name {
				case "Elem":
					desc.Elem = parseTypeExpr(v.Value, h)
				case "Deref":
					if b, ok := parseBoolIdent(v.Value); ok {
						desc.Deref = boolPtr(b)
					}
				}
			}
		}
	}
	// fallback: if Elem is nil and there are unkeyed elts, try first as elem
	if desc.Elem == nil {
		for _, elt := range lit.Elts {
			if _, ok := elt.(*ast.KeyValueExpr); ok {
				continue
			}
			desc.Elem = parseTypeExpr(elt, h)
			break
		}
	}
	if desc.Elem == nil {
		desc.Elem = &TypeDesc{Kind: "any"}
	}
	return desc
}

func parseObjectFromConstructor(fun string, call *ast.CallExpr, h *commentHelper) *TypeDesc {
	switch fun {
	case "NewStrictObjectType":
		if len(call.Args) == 1 {
			if mlit, ok := call.Args[0].(*ast.CompositeLit); ok {
				return &TypeDesc{
					Kind:   "object",
					Strict: boolPtr(true),
					Props:  parseMapLiteralProps(mlit, h),
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
					Props:  parseMapLiteralProps(mlit, h),
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
			mapped = parseTypeExpr(call.Args[0], h)
		}
		return &TypeDesc{Kind: "object", Strict: boolPtr(false), Props: map[string]*TypeDesc{}, Mapped: mapped}
	default:
		return nil
	}
}

func parseTypeExpr(e ast.Expr, h *commentHelper) *TypeDesc {
	switch t := e.(type) {
	case *ast.CompositeLit:
		// Handle primitives like StringType{}, NumberType{}, BoolType{}, AnyType{}, NullType{}
		if name := identName(t.Type); name != "" {
			if name == "ArrayType" {
				return parseArrayTypeFromComposite(t, h)
			}
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
			if obj := parseObjectFromConstructor(name, t, h); obj != nil {
				return obj
			}
		}
		return &TypeDesc{Kind: "any"}
	case *ast.UnaryExpr:
		// Handle pointer literals like &ArrayType{...} if ever present
		return parseTypeExpr(t.X, h)
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

type FuncSigDesc struct {
	Name    string      `json:"name"`
	Ret     *TypeDesc   `json:"ret"`
	Params  []*TypeDesc `json:"params"`
	Varargs bool        `json:"varargs,omitempty"`
	Doc     string      `json:"doc,omitempty"`
	DocURLs []string    `json:"docUrls,omitempty"`
}

func extractBuiltinGlobalVariableTypes(filePath string) (map[string]*TypeDesc, error) {
	fset := token.NewFileSet()
	astFile, err := parser.ParseFile(fset, filePath, nil, parser.ParseComments)
	if err != nil {
		return nil, fmt.Errorf("parse error: %w", err)
	}
	h := &commentHelper{fset: fset, comments: astFile.Comments}

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
					td := parseTypeExpr(kv.Value, h)
					result[key] = td
				}
				return result, nil
			}
		}
	}
	return nil, fmt.Errorf("BuiltinGlobalVariableTypes not found")
}

func extractBuiltinFuncSignatures(filePath string) (map[string][]*FuncSigDesc, error) {
	fset := token.NewFileSet()
	astFile, err := parser.ParseFile(fset, filePath, nil, parser.ParseComments)
	if err != nil {
		return nil, fmt.Errorf("parse error: %w", err)
	}
	h := &commentHelper{fset: fset, comments: astFile.Comments}
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
				if name.Name != "BuiltinFuncSignatures" {
					continue
				}
				if len(vs.Values) <= i {
					continue
				}
				mcl, ok := vs.Values[i].(*ast.CompositeLit)
				if !ok {
					return nil, fmt.Errorf("BuiltinFuncSignatures is not a composite literal")
				}
				result := map[string][]*FuncSigDesc{}
				for _, elt := range mcl.Elts {
					kv, ok := elt.(*ast.KeyValueExpr)
					if !ok {
						continue
					}
					k, ok := kv.Key.(*ast.BasicLit)
					if !ok || k.Kind != token.STRING {
						continue
					}
					funcKey, err := strconv.Unquote(k.Value)
					if err != nil {
						continue
					}
					listLit, ok := kv.Value.(*ast.CompositeLit)
					if !ok {
						continue
					}
					var sigs []*FuncSigDesc
					for _, e := range listLit.Elts {
						slit, ok := e.(*ast.CompositeLit)
						if !ok {
							continue
						}
						desc := &FuncSigDesc{}
						for _, fld := range slit.Elts {
							kvf, ok := fld.(*ast.KeyValueExpr)
							if !ok {
								continue
							}
							fieldName := ""
							if id, ok := kvf.Key.(*ast.Ident); ok {
								fieldName = id.Name
							}
							switch fieldName {
							case "Name":
								if bl, ok := kvf.Value.(*ast.BasicLit); ok && bl.Kind == token.STRING {
                                    if v, err := strconv.Unquote(bl.Value); err == nil {
										desc.Name = v
									}
								}
							case "Ret":
								desc.Ret = parseTypeExpr(kvf.Value, h)
							case "Params":
								if plit, ok := kvf.Value.(*ast.CompositeLit); ok {
									var params []*TypeDesc
									for _, pe := range plit.Elts {
										params = append(params, parseTypeExpr(pe, h))
									}
									desc.Params = params
								} else {
									desc.Params = []*TypeDesc{}
								}
							case "VariableLengthParams":
								if b, ok := parseBoolIdent(kvf.Value); ok {
									desc.Varargs = b
								}
							}
						}
						// default empty slices
						if desc.Params == nil {
							desc.Params = []*TypeDesc{}
						}
						sigs = append(sigs, desc)
					}
					// keep the map key as declared (lowercase), but we expose each desc.Name too
					result[funcKey] = sigs
				}
				return result, nil
			}
		}
	}
	return nil, fmt.Errorf("BuiltinFuncSignatures not found")
}

func main() {
	// Resolve absolute path to the actionlint semantics file
	cwd, _ := os.Getwd()
	target := filepath.Join(cwd, "scripts", "actionlint", "expr_sema.go")
	varsOutPath := filepath.Join(cwd, "scripts", "actionlint", "builtin-global-variable-types.json")
	funcsOutPath := filepath.Join(cwd, "scripts", "actionlint", "builtin-func-signatures.json")

	m, err := extractBuiltinGlobalVariableTypes(target)
	if err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}

	// Ensure directory exists
	if err := os.MkdirAll(filepath.Dir(varsOutPath), 0o755); err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}

	f, err := os.Create(varsOutPath)
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

	// Extract and write function signatures
	sigs, err := extractBuiltinFuncSignatures(target)
	if err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}
	f2, err := os.Create(funcsOutPath)
	if err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}
	defer f2.Close()
	enc2 := json.NewEncoder(f2)
	enc2.SetIndent("", "  ")
	if err := enc2.Encode(sigs); err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}
}
