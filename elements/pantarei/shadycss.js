(function() {
    /*

    Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    */
    'use strict';
    var $jscomp = {
        scope: {},
        owns: function(a, b) {
            return Object.prototype.hasOwnProperty.call(a, b)
        }
    };
    $jscomp.defineProperty = "function" == typeof Object.defineProperties ? Object.defineProperty : function(a, b, c) {
        if (c.get || c.set) throw new TypeError("ES3 does not support getters and setters.");
        a != Array.prototype && a != Object.prototype && (a[b] = c.value)
    };
    $jscomp.getGlobal = function(a) {
        return "undefined" != typeof window && window === a ? a : "undefined" != typeof global ? global : a
    };
    $jscomp.global = $jscomp.getGlobal(this);
    $jscomp.polyfill = function(a, b, c, d) {
        if (b) {
            c = $jscomp.global;
            a = a.split(".");
            for (d = 0; d < a.length - 1; d++) {
                var e = a[d];
                e in c || (c[e] = {});
                c = c[e]
            }
            a = a[a.length - 1];
            d = c[a];
            b = b(d);
            b != d && null != b && $jscomp.defineProperty(c, a, {
                configurable: !0,
                writable: !0,
                value: b
            })
        }
    };
    $jscomp.polyfill("Object.assign", function(a) {
        return a ? a : function(a, c) {
            for (var d = 1; d < arguments.length; d++) {
                var e = arguments[d];
                if (e)
                    for (var f in e) $jscomp.owns(e, f) && (a[f] = e[f])
            }
            return a
        }
    }, "es6-impl", "es3");
    $jscomp.polyfill("Reflect.apply", function(a) {
        if (a) return a;
        var b = Function.prototype.apply;
        return function(a, d, e) {
            return b.call(a, d, e)
        }
    }, "es6", "es3");
    $jscomp.polyfill("Reflect.construct", function(a) {
        return a ? a : function(a, c, d) {
            void 0 === d && (d = a);
            d = Object.create(d.prototype || Object.prototype);
            return Reflect.apply(a, d, c) || d
        }
    }, "es6", "es5");
    var module$$src$css_parse = {};

    function parse$$module$$src$css_parse(a) {
        a = clean$$module$$src$css_parse(a);
        return parseCss$$module$$src$css_parse(lex$$module$$src$css_parse(a), a)
    }

    function clean$$module$$src$css_parse(a) {
        return a.replace(RX$$module$$src$css_parse.comments, "").replace(RX$$module$$src$css_parse.port, "")
    }

    function lex$$module$$src$css_parse(a) {
        for (var b = {
                start: 0,
                end: a.length
            }, c = b, d = 0, e = a.length; d < e; d++)
            if (a[d] === OPEN_BRACE$$module$$src$css_parse) {
                c.rules || (c.rules = []);
                var f = c,
                    c = {
                        start: d + 1,
                        parent: f,
                        previous: f.rules[f.rules.length - 1]
                    };
                f.rules.push(c)
            } else a[d] === CLOSE_BRACE$$module$$src$css_parse && (c.end = d + 1, c = c.parent || b);
        return b
    }

    function parseCss$$module$$src$css_parse(a, b) {
        var c = b.substring(a.start, a.end - 1);
        a.parsedCssText = a.cssText = c.trim();
        a.parent && (c = b.substring(a.previous ? a.previous.end : a.parent.start, a.start - 1), c = _expandUnicodeEscapes$$module$$src$css_parse(c), c = c.replace(RX$$module$$src$css_parse.multipleSpaces, " "), c = c.substring(c.lastIndexOf(";") + 1), c = a.parsedSelector = a.selector = c.trim(), a.atRule = 0 === c.indexOf(AT_START$$module$$src$css_parse), a.atRule ? 0 === c.indexOf(MEDIA_START$$module$$src$css_parse) ? a.type = types$$module$$src$css_parse.MEDIA_RULE :
            c.match(RX$$module$$src$css_parse.keyframesRule) && (a.type = types$$module$$src$css_parse.KEYFRAMES_RULE, a.keyframesName = a.selector.split(RX$$module$$src$css_parse.multipleSpaces).pop()) : 0 === c.indexOf(VAR_START$$module$$src$css_parse) ? a.type = types$$module$$src$css_parse.MIXIN_RULE : a.type = types$$module$$src$css_parse.STYLE_RULE);
        if (c = a.rules)
            for (var d = 0, e = c.length, f; d < e && (f = c[d]); d++) parseCss$$module$$src$css_parse(f, b);
        return a
    }

    function _expandUnicodeEscapes$$module$$src$css_parse(a) {
        return a.replace(/\\([0-9a-f]{1,6})\s/gi, function(a, c) {
            a = c;
            for (c = 6 - a.length; c--;) a = "0" + a;
            return "\\" + a
        })
    }

    function stringify$$module$$src$css_parse(a, b, c) {
        c = c || "";
        var d = "";
        if (a.cssText || a.rules) {
            var e = a.rules;
            if (e && !_hasMixinRules$$module$$src$css_parse(e))
                for (var f = 0, g = e.length, h; f < g && (h = e[f]); f++) d = stringify$$module$$src$css_parse(h, b, d);
            else d = b ? a.cssText : removeCustomProps$$module$$src$css_parse(a.cssText), (d = d.trim()) && (d = "  " + d + "\n")
        }
        d && (a.selector && (c += a.selector + " " + OPEN_BRACE$$module$$src$css_parse + "\n"), c += d, a.selector && (c += CLOSE_BRACE$$module$$src$css_parse + "\n\n"));
        return c
    }

    function _hasMixinRules$$module$$src$css_parse(a) {
        return 0 === a[0].selector.indexOf(VAR_START$$module$$src$css_parse)
    }

    function removeCustomProps$$module$$src$css_parse(a) {
        a = removeCustomPropAssignment$$module$$src$css_parse(a);
        return removeCustomPropApply$$module$$src$css_parse(a)
    }

    function removeCustomPropAssignment$$module$$src$css_parse(a) {
        return a.replace(RX$$module$$src$css_parse.customProp, "").replace(RX$$module$$src$css_parse.mixinProp, "")
    }

    function removeCustomPropApply$$module$$src$css_parse(a) {
        return a.replace(RX$$module$$src$css_parse.mixinApply, "").replace(RX$$module$$src$css_parse.varApply, "")
    }
    var types$$module$$src$css_parse = {
            STYLE_RULE: 1,
            KEYFRAMES_RULE: 7,
            MEDIA_RULE: 4,
            MIXIN_RULE: 1E3
        },
        OPEN_BRACE$$module$$src$css_parse = "{",
        CLOSE_BRACE$$module$$src$css_parse = "}",
        RX$$module$$src$css_parse = {
            comments: /\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim,
            port: /@import[^;]*;/gim,
            customProp: /(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?(?:[;\n]|$)/gim,
            mixinProp: /(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?{[^}]*?}(?:[;\n]|$)?/gim,
            mixinApply: /@apply\s*\(?[^);]*\)?\s*(?:[;\n]|$)?/gim,
            varApply: /[^;:]*?:[^;]*?var\([^;]*\)(?:[;\n]|$)?/gim,
            keyframesRule: /^@[^\s]*keyframes/,
            multipleSpaces: /\s+/g
        },
        VAR_START$$module$$src$css_parse = "--",
        MEDIA_START$$module$$src$css_parse = "@media",
        AT_START$$module$$src$css_parse = "@";
    module$$src$css_parse.parse = parse$$module$$src$css_parse;
    module$$src$css_parse.stringify = stringify$$module$$src$css_parse;
    module$$src$css_parse.removeCustomPropAssignment = removeCustomPropAssignment$$module$$src$css_parse;
    module$$src$css_parse.types = types$$module$$src$css_parse;
    var module$$src$style_settings = {},
        nativeShadow$$module$$src$style_settings = !(window.ShadyDOM && window.ShadyDOM.inUse),
        forceShimCssProperties$$module$$src$style_settings;

    function parseSettings$$module$$src$style_settings(a) {
        a && (forceShimCssProperties$$module$$src$style_settings = a.shimcssproperties)
    }
    window.ShadyCSS ? parseSettings$$module$$src$style_settings(window.ShadyCSS) : window.WebComponents && parseSettings$$module$$src$style_settings(window.WebComponents.flags);
    var nativeCssVariables$$module$$src$style_settings = !forceShimCssProperties$$module$$src$style_settings && !navigator.userAgent.match("AppleWebKit/601") && window.CSS && CSS.supports && CSS.supports("box-shadow", "0 0 0 var(--foo)");

    function detectNativeApply$$module$$src$style_settings() {
        var a = document.createElement("style");
        a.textContent = ".foo { @apply --foo }";
        document.head.appendChild(a);
        var b = 0 <= a.sheet.cssRules[0].cssText.indexOf("apply");
        document.head.removeChild(a);
        return b
    }
    var nativeCssApply$$module$$src$style_settings = !1;
    module$$src$style_settings.nativeShadow = nativeShadow$$module$$src$style_settings;
    module$$src$style_settings.nativeCssVariables = nativeCssVariables$$module$$src$style_settings;
    module$$src$style_settings.nativeCssApply = nativeCssApply$$module$$src$style_settings;
    var module$$src$style_util = {};

    function toCssText$$module$$src$style_util(a, b) {
        "string" === typeof a && (a = module$$src$css_parse.parse(a));
        b && forEachRule$$module$$src$style_util(a, b);
        return module$$src$css_parse.stringify(a, module$$src$style_settings.nativeCssVariables)
    }

    function rulesForStyle$$module$$src$style_util(a) {
        !a.__cssRules && a.textContent && (a.__cssRules = module$$src$css_parse.parse(a.textContent));
        return a.__cssRules
    }

    function isKeyframesSelector$$module$$src$style_util(a) {
        return a.parent && a.parent.type === module$$src$css_parse.types.KEYFRAMES_RULE
    }

    function forEachRule$$module$$src$style_util(a, b, c, d) {
        if (a) {
            var e = !1;
            if (d && a.type === module$$src$css_parse.types.MEDIA_RULE) {
                var f = a.selector.match(rx$$module$$src$style_util.MEDIA_MATCH);
                f && (window.matchMedia(f[1]).matches || (e = !0))
            }
            a.type === module$$src$css_parse.types.STYLE_RULE ? b(a) : c && a.type === module$$src$css_parse.types.KEYFRAMES_RULE ? c(a) : a.type === module$$src$css_parse.types.MIXIN_RULE && (e = !0);
            if ((a = a.rules) && !e)
                for (var e = 0, f = a.length, g; e < f && (g = a[e]); e++) forEachRule$$module$$src$style_util(g,
                    b, c, d)
        }
    }

    function applyCss$$module$$src$style_util(a, b, c, d) {
        a = createScopeStyle$$module$$src$style_util(a, b);
        return applyStyle$$module$$src$style_util(a, c, d)
    }

    function applyStyle$$module$$src$style_util(a, b, c) {
        b = b || document.head;
        c = c && c.nextSibling || b.firstChild;
        lastHeadApplyNode$$module$$src$style_util = a;
        return b.insertBefore(a, c)
    }

    function createScopeStyle$$module$$src$style_util(a, b) {
        var c = document.createElement("style");
        b && c.setAttribute("scope", b);
        c.textContent = a;
        return c
    }
    var lastHeadApplyNode$$module$$src$style_util = null;

    function applyStylePlaceHolder$$module$$src$style_util(a) {
        a = document.createComment(" Shady DOM styles for " + a + " ");
        var b = document.head;
        b.insertBefore(a, (lastHeadApplyNode$$module$$src$style_util ? lastHeadApplyNode$$module$$src$style_util.nextSibling : null) || b.firstChild);
        return lastHeadApplyNode$$module$$src$style_util = a
    }

    function isTargetedBuild$$module$$src$style_util(a) {
        return module$$src$style_settings.nativeShadow ? "shadow" === a : "shady" === a
    }

    function getCssBuildType$$module$$src$style_util(a) {
        return a.getAttribute("css-build")
    }

    function findMatchingParen$$module$$src$style_util(a, b) {
        for (var c = 0, d = a.length; b < d; b++)
            if ("(" === a[b]) c++;
            else if (")" === a[b] && 0 === --c) return b;
        return -1
    }

    function processVariableAndFallback$$module$$src$style_util(a, b) {
        var c = a.indexOf("var(");
        if (-1 === c) return b(a, "", "", "");
        var d = findMatchingParen$$module$$src$style_util(a, c + 3),
            e = a.substring(c + 4, d),
            c = a.substring(0, c);
        a = processVariableAndFallback$$module$$src$style_util(a.substring(d + 1), b);
        var f = e.indexOf(",");
        if (-1 === f) return b(c, e.trim(), "", a);
        d = e.substring(0, f).trim();
        e = e.substring(f + 1).trim();
        return b(c, d, e, a)
    }
    var rx$$module$$src$style_util = {
        VAR_ASSIGN: /(?:^|[;\s{]\s*)(--[\w-]*?)\s*:\s*(?:([^;{]*)|{([^}]*)})(?:(?=[;\s}])|$)/gi,
        MIXIN_MATCH: /(?:^|\W+)@apply\s*\(?([^);\n]*)\)?/gi,
        VAR_CONSUMED: /(--[\w-]+)\s*([:,;)]|$)/gi,
        ANIMATION_MATCH: /(animation\s*:)|(animation-name\s*:)/,
        MEDIA_MATCH: /@media[^(]*(\([^)]*\))/,
        IS_VAR: /^--/,
        BRACKETED: /\{[^}]*\}/g,
        HOST_PREFIX: "(?:^|[^.#[:])",
        HOST_SUFFIX: "($|[.:[\\s>+~])"
    };
    module$$src$style_util.toCssText = toCssText$$module$$src$style_util;
    module$$src$style_util.rulesForStyle = rulesForStyle$$module$$src$style_util;
    module$$src$style_util.isKeyframesSelector = isKeyframesSelector$$module$$src$style_util;
    module$$src$style_util.forEachRule = forEachRule$$module$$src$style_util;
    module$$src$style_util.applyCss = applyCss$$module$$src$style_util;
    module$$src$style_util.applyStyle = applyStyle$$module$$src$style_util;
    module$$src$style_util.createScopeStyle = createScopeStyle$$module$$src$style_util;
    module$$src$style_util.applyStylePlaceHolder = applyStylePlaceHolder$$module$$src$style_util;
    module$$src$style_util.isTargetedBuild = isTargetedBuild$$module$$src$style_util;
    module$$src$style_util.getCssBuildType = getCssBuildType$$module$$src$style_util;
    module$$src$style_util.processVariableAndFallback = processVariableAndFallback$$module$$src$style_util;
    module$$src$style_util.rx = rx$$module$$src$style_util;
    var module$$src$style_transformer = {},
        StyleTransformer$$module$$src$style_transformer = {
            dom: function(a, b, c) {
                a.__styleScoped ? a.__styleScoped = null : this._transformDom(a, b || "", c)
            },
            _transformDom: function(a, b, c) {
                a.classList && this.element(a, b, c);
                if (a = "template" === a.localName ? (a.content || a._content).childNodes : a.children)
                    for (var d = 0; d < a.length; d++) this._transformDom(a[d], b, c)
            },
            element: function(a, b, c) {
                if (b)
                    if (a.classList) c ? (a.classList.remove(SCOPE_NAME$$module$$src$style_transformer), a.classList.remove(b)) :
                        (a.classList.add(SCOPE_NAME$$module$$src$style_transformer), a.classList.add(b));
                    else if (a.getAttribute) {
                    var d = a.getAttribute(CLASS$$module$$src$style_transformer);
                    c ? d && a.setAttribute(CLASS$$module$$src$style_transformer, d.replace(SCOPE_NAME$$module$$src$style_transformer, "").replace(b, "")) : a.setAttribute(CLASS$$module$$src$style_transformer, (d ? d + " " : "") + SCOPE_NAME$$module$$src$style_transformer + " " + b)
                }
            },
            elementStyles: function(a, b, c) {
                var d = a.__cssBuild;
                return (module$$src$style_settings.nativeShadow ||
                    "shady" === d ? module$$src$style_util.toCssText(b, c) : this.css(b, a.is, a.extends, c) + "\n\n").trim()
            },
            css: function(a, b, c, d) {
                var e = this._calcHostScope(b, c);
                b = this._calcElementScope(b);
                var f = this;
                return module$$src$style_util.toCssText(a, function(a) {
                    a.isScoped || (f.rule(a, b, e), a.isScoped = !0);
                    d && d(a, b, e)
                })
            },
            _calcElementScope: function(a) {
                return a ? CSS_CLASS_PREFIX$$module$$src$style_transformer + a : ""
            },
            _calcHostScope: function(a, b) {
                return b ? "[is=" + a + "]" : a
            },
            rule: function(a, b, c) {
                this._transformRule(a, this._transformComplexSelector,
                    b, c)
            },
            _transformRule: function(a, b, c, d) {
                a.selector = a.transformedSelector = this._transformRuleCss(a, b, c, d)
            },
            _transformRuleCss: function(a, b, c, d) {
                var e = a.selector.split(COMPLEX_SELECTOR_SEP$$module$$src$style_transformer);
                if (!module$$src$style_util.isKeyframesSelector(a)) {
                    a = 0;
                    for (var f = e.length, g; a < f && (g = e[a]); a++) e[a] = b.call(this, g, c, d)
                }
                return e.join(COMPLEX_SELECTOR_SEP$$module$$src$style_transformer)
            },
            _transformComplexSelector: function(a, b, c) {
                var d = this,
                    e = !1;
                a = a.trim();
                return a = a.replace(SIMPLE_SELECTOR_SEP$$module$$src$style_transformer,
                    function(a, g, h) {
                        e || (a = d._transformCompoundSelector(h, g, b, c), e = e || a.stop, g = a.combinator, h = a.value);
                        return g + h
                    })
            },
            _transformCompoundSelector: function(a, b, c, d) {
                var e = a.indexOf(SLOTTED$$module$$src$style_transformer);
                0 <= a.indexOf(HOST$$module$$src$style_transformer) ? a = this._transformHostSelector(a, d) : 0 !== e && (a = c ? this._transformSimpleSelector(a, c) : a);
                c = !1;
                0 <= e && (b = "", c = !0);
                var f;
                c && (f = !0, c && (a = a.replace(SLOTTED_PAREN$$module$$src$style_transformer, function(a, b) {
                    return " > " + b
                })));
                a = a.replace(DIR_PAREN$$module$$src$style_transformer,
                    function(a, b, c) {
                        return '[dir="' + c + '"] ' + b + ", " + b + '[dir="' + c + '"]'
                    });
                return {
                    value: a,
                    combinator: b,
                    stop: f
                }
            },
            _transformSimpleSelector: function(a, b) {
                a = a.split(PSEUDO_PREFIX$$module$$src$style_transformer);
                a[0] += b;
                return a.join(PSEUDO_PREFIX$$module$$src$style_transformer)
            },
            _transformHostSelector: function(a, b) {
                var c = a.match(HOST_PAREN$$module$$src$style_transformer);
                return (c = c && c[2].trim() || "") ? c[0].match(SIMPLE_SELECTOR_PREFIX$$module$$src$style_transformer) ? a.replace(HOST_PAREN$$module$$src$style_transformer,
                    function(a, c, f) {
                        return b + f
                    }) : c.split(SIMPLE_SELECTOR_PREFIX$$module$$src$style_transformer)[0] === b ? c : SELECTOR_NO_MATCH$$module$$src$style_transformer : a.replace(HOST$$module$$src$style_transformer, b)
            },
            documentRule: function(a) {
                a.selector = a.parsedSelector;
                this.normalizeRootSelector(a);
                this._transformRule(a, this._transformDocumentSelector)
            },
            normalizeRootSelector: function(a) {
                a.selector === ROOT$$module$$src$style_transformer && (a.selector = "html")
            },
            _transformDocumentSelector: function(a) {
                return a.match(SLOTTED$$module$$src$style_transformer) ?
                    this._transformComplexSelector(a, SCOPE_DOC_SELECTOR$$module$$src$style_transformer) : this._transformSimpleSelector(a.trim(), SCOPE_DOC_SELECTOR$$module$$src$style_transformer)
            },
            SCOPE_NAME: "style-scope"
        },
        SCOPE_NAME$$module$$src$style_transformer = StyleTransformer$$module$$src$style_transformer.SCOPE_NAME,
        SCOPE_DOC_SELECTOR$$module$$src$style_transformer = ":not([" + SCOPE_NAME$$module$$src$style_transformer + "]):not(." + SCOPE_NAME$$module$$src$style_transformer + ")",
        COMPLEX_SELECTOR_SEP$$module$$src$style_transformer =
        ",",
        SIMPLE_SELECTOR_SEP$$module$$src$style_transformer = /(^|[\s>+~]+)((?:\[.+?\]|[^\s>+~=\[])+)/g,
        SIMPLE_SELECTOR_PREFIX$$module$$src$style_transformer = /[[.:#*]/,
        HOST$$module$$src$style_transformer = ":host",
        ROOT$$module$$src$style_transformer = ":root",
        SLOTTED$$module$$src$style_transformer = "::slotted",
        HOST_PAREN$$module$$src$style_transformer = /(:host)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))/,
        SLOTTED_PAREN$$module$$src$style_transformer = /(?:::slotted)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))/,
        DIR_PAREN$$module$$src$style_transformer =
        /(.*):dir\((?:(ltr|rtl))\)/,
        CSS_CLASS_PREFIX$$module$$src$style_transformer = ".",
        PSEUDO_PREFIX$$module$$src$style_transformer = ":",
        CLASS$$module$$src$style_transformer = "class",
        SELECTOR_NO_MATCH$$module$$src$style_transformer = "should_not_match";
    module$$src$style_transformer.StyleTransformer = StyleTransformer$$module$$src$style_transformer;
    var module$$src$style_info = {},
        StyleInfo$$module$$src$style_info = function(a, b, c, d, e, f) {
            this.styleRules = a || null;
            this.placeholder = b || null;
            this.ownStylePropertyNames = c || [];
            this.overrideStyleProperties = {};
            this.elementName = d || "";
            this.cssBuild = f || "";
            this.typeExtension = e || "";
            this.customStyle = this.scopeSelector = this.styleProperties = null
        };
    StyleInfo$$module$$src$style_info.get = function(a) {
        return a.__styleInfo
    };
    StyleInfo$$module$$src$style_info.set = function(a, b) {
        return a.__styleInfo = b
    };
    module$$src$style_info.default = StyleInfo$$module$$src$style_info;
    var module$$src$style_properties = {},
        p$$module$$src$style_properties = window.Element.prototype,
        matchesSelector$$module$$src$style_properties = p$$module$$src$style_properties.matches || p$$module$$src$style_properties.matchesSelector || p$$module$$src$style_properties.mozMatchesSelector || p$$module$$src$style_properties.msMatchesSelector || p$$module$$src$style_properties.oMatchesSelector || p$$module$$src$style_properties.webkitMatchesSelector,
        IS_IE$$module$$src$style_properties = navigator.userAgent.match("Trident"),
        StyleProperties$$module$$src$style_properties = {
            decorateStyles: function(a) {
                var b = this,
                    c = {},
                    d = [],
                    e = 0;
                module$$src$style_util.forEachRule(a, function(a) {
                    b.decorateRule(a);
                    a.index = e++;
                    b.collectPropertiesInCssText(a.propertyInfo.cssText, c)
                }, function(a) {
                    d.push(a)
                });
                a._keyframes = d;
                a = [];
                for (var f in c) a.push(f);
                return a
            },
            decorateRule: function(a) {
                if (a.propertyInfo) return a.propertyInfo;
                var b = {},
                    c = {};
                this.collectProperties(a, c) && (b.properties = c, a.rules = null);
                b.cssText = this.collectCssText(a);
                return a.propertyInfo =
                    b
            },
            collectProperties: function(a, b) {
                var c = a.propertyInfo;
                if (c) {
                    if (c.properties) return Object.assign(b, c.properties), !0
                } else {
                    for (var c = this.rx.VAR_ASSIGN, d = a.parsedCssText, e; a = c.exec(d);) {
                        e = (a[2] || a[3]).trim();
                        if ("inherit" !== e || "unset" !== e) b[a[1].trim()] = e;
                        e = !0
                    }
                    return e
                }
            },
            collectCssText: function(a) {
                return this.collectConsumingCssText(a.parsedCssText)
            },
            collectConsumingCssText: function(a) {
                return a.replace(this.rx.BRACKETED, "").replace(this.rx.VAR_ASSIGN, "")
            },
            collectPropertiesInCssText: function(a, b) {
                for (var c; c =
                    this.rx.VAR_CONSUMED.exec(a);) {
                    var d = c[1];
                    ":" !== c[2] && (b[d] = !0)
                }
            },
            reify: function(a) {
                for (var b = Object.getOwnPropertyNames(a), c = 0, d; c < b.length; c++) d = b[c], a[d] = this.valueForProperty(a[d], a)
            },
            valueForProperty: function(a, b) {
                if (a)
                    if (0 <= a.indexOf(";")) a = this.valueForProperties(a, b);
                    else {
                        var c = this;
                        a = module$$src$style_util.processVariableAndFallback(a, function(a, e, f, g) {
                            if (!e) return a + g;
                            (e = c.valueForProperty(b[e], b)) && "initial" !== e ? "apply-shim-inherit" === e && (e = "inherit") : e = c.valueForProperty(b[f] || f, b) || f;
                            return a + (e || "") + g
                        })
                    }
                return a && a.trim() || ""
            },
            valueForProperties: function(a, b) {
                a = a.split(";");
                for (var c = 0, d, e; c < a.length; c++)
                    if (d = a[c]) {
                        this.rx.MIXIN_MATCH.lastIndex = 0;
                        if (e = this.rx.MIXIN_MATCH.exec(d)) d = this.valueForProperty(b[e[1]], b);
                        else if (e = d.indexOf(":"), -1 !== e) {
                            var f = d.substring(e),
                                f = f.trim(),
                                f = this.valueForProperty(f, b) || f;
                            d = d.substring(0, e) + f
                        }
                        a[c] = d && d.lastIndexOf(";") === d.length - 1 ? d.slice(0, -1) : d || ""
                    }
                return a.join(";")
            },
            applyProperties: function(a, b) {
                var c = "";
                a.propertyInfo || this.decorateRule(a);
                a.propertyInfo.cssText && (c = this.valueForProperties(a.propertyInfo.cssText, b));
                a.cssText = c
            },
            applyKeyframeTransforms: function(a, b) {
                var c = a.cssText,
                    d = a.cssText;
                null == a.hasAnimations && (a.hasAnimations = this.rx.ANIMATION_MATCH.test(c));
                if (a.hasAnimations)
                    if (null == a.keyframeNamesToTransform) {
                        a.keyframeNamesToTransform = [];
                        for (var e in b) d = b[e], d = d(c), c !== d && (c = d, a.keyframeNamesToTransform.push(e))
                    } else {
                        for (e = 0; e < a.keyframeNamesToTransform.length; ++e) d = b[a.keyframeNamesToTransform[e]], c = d(c);
                        d = c
                    }
                a.cssText =
                    d
            },
            propertyDataFromStyles: function(a, b) {
                var c = {},
                    d = this,
                    e = [];
                module$$src$style_util.forEachRule(a, function(a) {
                    a.propertyInfo || d.decorateRule(a);
                    var g = a.transformedSelector || a.parsedSelector;
                    b && a.propertyInfo.properties && g && matchesSelector$$module$$src$style_properties.call(b, g) && (d.collectProperties(a, c), addToBitMask$$module$$src$style_properties(a.index, e))
                }, null, !0);
                return {
                    properties: c,
                    key: e
                }
            },
            whenHostOrRootRule: function(a, b, c, d) {
                b.propertyInfo || this.decorateRule(b);
                if (b.propertyInfo.properties) {
                    var e =
                        a.is ? module$$src$style_transformer.StyleTransformer._calcHostScope(a.is, a.extends) : "html",
                        f = b.parsedSelector,
                        g = ":host > *" === f || "html" === f,
                        h = 0 === f.indexOf(":host") && !g;
                    "shady" === c && (g = f === e + " > *." + e || -1 !== f.indexOf("html"), h = !g && 0 === f.indexOf(e));
                    "shadow" === c && (g = ":host > *" === f || "html" === f, h = h && !g);
                    if (g || h) c = e, h && (module$$src$style_settings.nativeShadow && !b.transformedSelector && (b.transformedSelector = module$$src$style_transformer.StyleTransformer._transformRuleCss(b, module$$src$style_transformer.StyleTransformer._transformComplexSelector,
                        module$$src$style_transformer.StyleTransformer._calcElementScope(a.is), e)), c = b.transformedSelector || e), d({
                        selector: c,
                        isHost: h,
                        isRoot: g
                    })
                }
            },
            hostAndRootPropertiesForScope: function(a, b) {
                var c = {},
                    d = {},
                    e = this,
                    f = b && b.__cssBuild;
                module$$src$style_util.forEachRule(b, function(b) {
                    e.whenHostOrRootRule(a, b, f, function(f) {
                        matchesSelector$$module$$src$style_properties.call(a._element || a, f.selector) && (f.isHost ? e.collectProperties(b, c) : e.collectProperties(b, d))
                    })
                }, null, !0);
                return {
                    rootProps: d,
                    hostProps: c
                }
            },
            transformStyles: function(a,
                b, c) {
                var d = this,
                    e = module$$src$style_transformer.StyleTransformer._calcHostScope(a.is, a.extends),
                    f = a.extends ? "\\" + e.slice(0, -1) + "\\]" : e,
                    g = new RegExp(this.rx.HOST_PREFIX + f + this.rx.HOST_SUFFIX),
                    f = module$$src$style_info.default.get(a).styleRules,
                    h = this._elementKeyframeTransforms(a, f, c);
                return module$$src$style_transformer.StyleTransformer.elementStyles(a, f, function(a) {
                    d.applyProperties(a, b);
                    module$$src$style_settings.nativeShadow || module$$src$style_util.isKeyframesSelector(a) || !a.cssText || (d.applyKeyframeTransforms(a,
                        h), d._scopeSelector(a, g, e, c))
                })
            },
            _elementKeyframeTransforms: function(a, b, c) {
                a = b._keyframes;
                b = {};
                if (!module$$src$style_settings.nativeShadow && a)
                    for (var d = 0, e = a[d]; d < a.length; e = a[++d]) this._scopeKeyframes(e, c), b[e.keyframesName] = this._keyframesRuleTransformer(e);
                return b
            },
            _keyframesRuleTransformer: function(a) {
                return function(b) {
                    return b.replace(a.keyframesNameRx, a.transformedKeyframesName)
                }
            },
            _scopeKeyframes: function(a, b) {
                a.keyframesNameRx = new RegExp(a.keyframesName, "g");
                a.transformedKeyframesName = a.keyframesName +
                    "-" + b;
                a.transformedSelector = a.transformedSelector || a.selector;
                a.selector = a.transformedSelector.replace(a.keyframesName, a.transformedKeyframesName)
            },
            _scopeSelector: function(a, b, c, d) {
                a.transformedSelector = a.transformedSelector || a.selector;
                d = "." + d;
                for (var e = a.transformedSelector.split(","), f = 0, g = e.length, h; f < g && (h = e[f]); f++) e[f] = h.match(b) ? h.replace(c, d) : d + " " + h;
                a.selector = e.join(",")
            },
            applyElementScopeSelector: function(a, b, c) {
                var d = a.getAttribute("class") || "";
                b = c ? d.replace(c, b) : (d ? d + " " : "") + this.XSCOPE_NAME +
                    " " + b;
                d !== b && a.setAttribute("class", b)
            },
            applyElementStyle: function(a, b, c, d) {
                b = d ? d.textContent || "" : this.transformStyles(a, b, c);
                var e = module$$src$style_info.default.get(a),
                    f = e.customStyle;
                f && !module$$src$style_settings.nativeShadow && f !== d && (f._useCount--, 0 >= f._useCount && f.parentNode && f.parentNode.removeChild(f));
                module$$src$style_settings.nativeShadow ? e.customStyle ? (e.customStyle.textContent = b, d = e.customStyle) : b && (d = module$$src$style_util.applyCss(b, c, a.shadowRoot, e.placeholder)) : d ? d.parentNode || module$$src$style_util.applyStyle(d,
                    null, e.placeholder) : b && (d = module$$src$style_util.applyCss(b, c, null, e.placeholder));
                d && (d._useCount = d._useCount || 0, e.customStyle != d && d._useCount++, e.customStyle = d);
                IS_IE$$module$$src$style_properties && (d.textContent = d.textContent);
                return d
            },
            applyCustomStyle: function(a, b) {
                var c = module$$src$style_util.rulesForStyle(a),
                    d = this;
                a.textContent = module$$src$style_util.toCssText(c, function(a) {
                    var c = a.cssText = a.parsedCssText;
                    a.propertyInfo && a.propertyInfo.cssText && (c = module$$src$css_parse.removeCustomPropAssignment(c),
                        a.cssText = d.valueForProperties(c, b))
                })
            },
            rx: module$$src$style_util.rx,
            XSCOPE_NAME: "x-scope"
        };

    function addToBitMask$$module$$src$style_properties(a, b) {
        var c = parseInt(a / 32);
        b[c] = (b[c] || 0) | 1 << a % 32
    }
    module$$src$style_properties.StyleProperties = StyleProperties$$module$$src$style_properties;
    var module$$src$template_map = {},
        $jscompDefaultExport$$module$$src$template_map = {};
    module$$src$template_map.default = $jscompDefaultExport$$module$$src$template_map;
    var module$$src$style_placeholder = {},
        placeholderMap$$module$$src$style_placeholder = {},
        ce$$module$$src$style_placeholder = window.customElements;
    if (ce$$module$$src$style_placeholder && !module$$src$style_settings.nativeShadow) {
        var origDefine = ce$$module$$src$style_placeholder.define;
        ce$$module$$src$style_placeholder.define = function(a, b, c) {
            placeholderMap$$module$$src$style_placeholder[a] = module$$src$style_util.applyStylePlaceHolder(a);
            return origDefine.call(ce$$module$$src$style_placeholder, a, b, c)
        }
    }
    var $jscompDefaultExport$$module$$src$style_placeholder = placeholderMap$$module$$src$style_placeholder;
    module$$src$style_placeholder.default = $jscompDefaultExport$$module$$src$style_placeholder;
    var module$$src$style_cache = {},
        StyleCache$$module$$src$style_cache = function(a) {
            this.cache = {};
            this.typeMax = void 0 === a ? 100 : a
        };
    StyleCache$$module$$src$style_cache.prototype._validate = function(a, b, c) {
        for (var d = 0; d < c.length; d++) {
            var e = c[d];
            if (a.properties[e] !== b[e]) return !1
        }
        return !0
    };
    StyleCache$$module$$src$style_cache.prototype.store = function(a, b, c, d) {
        var e = this.cache[a] || [];
        e.push({
            properties: b,
            styleElement: c,
            scopeSelector: d
        });
        e.length > this.typeMax && e.shift();
        this.cache[a] = e
    };
    StyleCache$$module$$src$style_cache.prototype.fetch = function(a, b, c) {
        if (a = this.cache[a])
            for (var d = a.length - 1; 0 <= d; d--) {
                var e = a[d];
                if (this._validate(e, b, c)) return e
            }
    };
    module$$src$style_cache.default = StyleCache$$module$$src$style_cache;
    var module$$src$apply_shim = {},
        MIXIN_MATCH$$module$$src$apply_shim = module$$src$style_util.rx.MIXIN_MATCH,
        VAR_ASSIGN$$module$$src$apply_shim = module$$src$style_util.rx.VAR_ASSIGN,
        APPLY_NAME_CLEAN$$module$$src$apply_shim = /;\s*/m,
        INITIAL_INHERIT$$module$$src$apply_shim = /^\s*(initial)|(inherit)\s*$/,
        MIXIN_VAR_SEP$$module$$src$apply_shim = "_-_",
        MixinMap$$module$$src$apply_shim = function() {
            this._map = {}
        };
    MixinMap$$module$$src$apply_shim.prototype.set = function(a, b) {
        a = a.trim();
        this._map[a] = {
            properties: b,
            dependants: {}
        }
    };
    MixinMap$$module$$src$apply_shim.prototype.get = function(a) {
        a = a.trim();
        return this._map[a]
    };
    var ApplyShim$$module$$src$apply_shim = function() {
        var a = this;
        this._measureElement = this._currentTemplate = null;
        this._map = new MixinMap$$module$$src$apply_shim;
        this._separator = MIXIN_VAR_SEP$$module$$src$apply_shim;
        this._boundProduceCssProperties = function(b, c, d, e) {
            return a._produceCssProperties(b, c, d, e)
        }
    };
    ApplyShim$$module$$src$apply_shim.prototype.transformStyle = function(a, b) {
        a = module$$src$style_util.rulesForStyle(a);
        this.transformRules(a, b);
        return a
    };
    ApplyShim$$module$$src$apply_shim.prototype.transformRules = function(a, b) {
        var c = this;
        this._currentTemplate = module$$src$template_map.default[b];
        module$$src$style_util.forEachRule(a, function(a) {
            c.transformRule(a)
        });
        this._currentTemplate && (this._currentTemplate.__applyShimInvalid = !1);
        this._currentTemplate = null
    };
    ApplyShim$$module$$src$apply_shim.prototype.transformRule = function(a) {
        a.cssText = this.transformCssText(a.parsedCssText);
        // ":root" === a.selector && (a.selector = ":host > *")
        ":root" === a.selector && window.chrome && (a.selector = ":host > *")
    };
    ApplyShim$$module$$src$apply_shim.prototype.transformCssText = function(a) {
        a = a.replace(VAR_ASSIGN$$module$$src$apply_shim, this._boundProduceCssProperties);
        return this._consumeCssProperties(a)
    };
    ApplyShim$$module$$src$apply_shim.prototype._getInitialValueForProperty = function(a) {
        this._measureElement || (this._measureElement = document.createElement("meta"), this._measureElement.style.all = "initial", document.head.appendChild(this._measureElement));
        return window.getComputedStyle(this._measureElement).getPropertyValue(a)
    };
    ApplyShim$$module$$src$apply_shim.prototype._consumeCssProperties = function(a) {
        for (var b; b = MIXIN_MATCH$$module$$src$apply_shim.exec(a);) {
            var c = b[0],
                d = b[1];
            b = b.index;
            var e = b + c.indexOf("@apply"),
                f = b + c.length,
                c = a.slice(0, e);
            a = a.slice(f);
            e = this._cssTextToMap(c);
            d = this._atApplyToCssProperties(d, e);
            a = [c, d, a].join("");
            MIXIN_MATCH$$module$$src$apply_shim.lastIndex = b + d.length
        }
        return a
    };
    ApplyShim$$module$$src$apply_shim.prototype._atApplyToCssProperties = function(a, b) {
        a = a.replace(APPLY_NAME_CLEAN$$module$$src$apply_shim, "");
        var c = [],
            d = this._map.get(a);
        d || (this._map.set(a, {}), d = this._map.get(a));
        if (d) {
            this._currentTemplate && (d.dependants[this._currentTemplate.name] = this._currentTemplate);
            var e, f;
            for (e in d.properties) f = b && b[e], d = [e, ": var(", a, MIXIN_VAR_SEP$$module$$src$apply_shim, e], f && d.push(",", f), d.push(")"), c.push(d.join(""))
        }
        return c.join("; ")
    };
    ApplyShim$$module$$src$apply_shim.prototype._replaceInitialOrInherit = function(a, b) {
        var c = INITIAL_INHERIT$$module$$src$apply_shim.exec(b);
        c && (b = c[1] ? ApplyShim$$module$$src$apply_shim._getInitialValueForProperty(a) : "apply-shim-inherit");
        return b
    };
    ApplyShim$$module$$src$apply_shim.prototype._cssTextToMap = function(a) {
        a = a.split(";");
        for (var b, c, d = {}, e = 0; e < a.length; e++)
            if (b = a[e]) c = b.split(":"), 1 < c.length && (b = c[0].trim(), c = this._replaceInitialOrInherit(b, c.slice(1).join(":")), d[b] = c);
        return d
    };
    ApplyShim$$module$$src$apply_shim.prototype._invalidateMixinEntry = function(a) {
        for (var b in a.dependants) b !== this._currentTemplate && (a.dependants[b].__applyShimInvalid = !0)
    };
    ApplyShim$$module$$src$apply_shim.prototype._produceCssProperties = function(a, b, c, d) {
        var e = this;
        c && module$$src$style_util.processVariableAndFallback(c, function(a, b) {
            b && e._map.get(b) && (d = "@apply " + b + ";")
        });
        if (!d) return a;
        var f = this._consumeCssProperties(d),
            g = a.slice(0, a.indexOf("--")),
            h = f = this._cssTextToMap(f),
            k = this._map.get(b),
            l = k && k.properties;
        l ? h = Object.assign(Object.create(l), f) : this._map.set(b, h);
        var p = [],
            m, n, q = !1;
        for (m in h) n = f[m], void 0 === n && (n = "initial"), !l || m in l || (q = !0), p.push(b + MIXIN_VAR_SEP$$module$$src$apply_shim +
            m + ": " + n);
        q && this._invalidateMixinEntry(k);
        k && (k.properties = h);
        c && (g = a + ";" + g);
        return g + p.join("; ") + ";"
    };
    var applyShim$$module$$src$apply_shim = new ApplyShim$$module$$src$apply_shim,
        $jscompDefaultExport$$module$$src$apply_shim = window.ApplyShim = applyShim$$module$$src$apply_shim;
    module$$src$apply_shim.default = $jscompDefaultExport$$module$$src$apply_shim;
    var module$$src$ShadyCSS = {},
        styleCache$$module$$src$ShadyCSS = new module$$src$style_cache.default,
        ShadyCSS$$module$$src$ShadyCSS = {
            scopeCounter: {},
            nativeShadow: module$$src$style_settings.nativeShadow,
            nativeCss: module$$src$style_settings.nativeCssVariables,
            nativeCssApply: module$$src$style_settings.nativeCssApply,
            _documentOwner: document.documentElement,
            _documentOwnerStyleInfo: module$$src$style_info.default.set(document.documentElement, new module$$src$style_info.default({
                rules: []
            })),
            _generateScopeSelector: function(a) {
                var b =
                    this.scopeCounter[a] = (this.scopeCounter[a] || 0) + 1;
                return a + "-" + b
            },
            getStyleAst: function(a) {
                return module$$src$style_util.rulesForStyle(a)
            },
            styleAstToString: function(a) {
                return module$$src$style_util.toCssText(a)
            },
            _gatherStyles: function(a) {
                a = a.content.querySelectorAll("style");
                for (var b = [], c = 0; c < a.length; c++) {
                    var d = a[c];
                    b.push(d.textContent);
                    d.parentNode.removeChild(d)
                }
                return b.join("").trim()
            },
            _getCssBuild: function(a) {
                return (a = a.content.querySelector("style")) ? a.getAttribute("css-build") || "" : ""
            },
            prepareTemplate: function(a,
                b, c) {
                if (!a._prepared) {
                    a._prepared = !0;
                    a.name = b;
                    a.extends = c;
                    module$$src$template_map.default[b] = a;
                    var d = this._getCssBuild(a),
                        e = this._gatherStyles(a);
                    c = {
                        is: b,
                        extends: c,
                        __cssBuild: d
                    };
                    this.nativeShadow || module$$src$style_transformer.StyleTransformer.dom(a.content, b);
                    e = module$$src$css_parse.parse(e);
                    this.nativeCss && !this.nativeCssApply && module$$src$apply_shim.default.transformRules(e, b);
                    a._styleAst = e;
                    e = [];
                    this.nativeCss || (e = module$$src$style_properties.StyleProperties.decorateStyles(a._styleAst, c));
                    if (!e.length ||
                        this.nativeCss) b = this._generateStaticStyle(c, a._styleAst, this.nativeShadow ? a.content : null, module$$src$style_placeholder.default[b]), a._style = b;
                    a._ownPropertyNames = e
                }
            },
            _generateStaticStyle: function(a, b, c, d) {
                b = module$$src$style_transformer.StyleTransformer.elementStyles(a, b);
                if (b.length) return module$$src$style_util.applyCss(b, a.is, c, d)
            },
            _prepareHost: function(a) {
                var b = a.getAttribute("is") || a.localName,
                    c;
                b !== a.localName && (c = a.localName);
                var d = module$$src$style_placeholder.default[b],
                    e = module$$src$template_map.default[b],
                    f, g, h;
                e && (f = e._styleAst, g = e._ownPropertyNames, h = e._cssBuild);
                return module$$src$style_info.default.set(a, new module$$src$style_info.default(f, d, g, b, c, h))
            },
            applyStyle: function(a, b) {
                if (window.CustomStyle) {
                    var c = window.CustomStyle;
                    c._documentDirty && (c.findStyles(), this.nativeCss ? this.nativeCssApply || c._revalidateApplyShim() : this._updateProperties(this._documentOwner, this._documentOwnerStyleInfo), c.applyStyles(), c._documentDirty = !1)
                }(c = module$$src$style_info.default.get(a)) || (c = this._prepareHost(a));
                var d = a.getAttribute("is") || a.localName;
                Object.assign(c.overrideStyleProperties, b);
                this.nativeCss ? ((b = module$$src$template_map.default[d]) && b.__applyShimInvalid && b._style && (module$$src$apply_shim.default.transformRules(b._styleAst, d), b._style.textContent = module$$src$style_transformer.StyleTransformer.elementStyles(a, c.styleRules), this.nativeShadow && (a.shadowRoot.querySelector("style").textContent = module$$src$style_transformer.StyleTransformer.elementStyles(a, c.styleRules)), c.styleRules = b._styleAst),
                    this._updateNativeProperties(a, c.overrideStyleProperties)) : (this._updateProperties(a, c), c.ownStylePropertyNames && c.ownStylePropertyNames.length && this._applyStyleProperties(a, c), (a = this._isRootOwner(a) ? a : a.shadowRoot) && this._applyToDescendants(a))
            },
            _applyToDescendants: function(a) {
                a = a.children;
                for (var b = 0, c; b < a.length; b++) c = a[b], c.shadowRoot && this.applyStyle(c), this._applyToDescendants(c)
            },
            _styleOwnerForNode: function(a) {
                return (a = a.getRootNode().host) ? module$$src$style_info.default.get(a) ? a : this._styleOwnerForNode(a) :
                    this._documentOwner
            },
            _isRootOwner: function(a) {
                return a === this._documentOwner
            },
            _applyStyleProperties: function(a, b) {
                var c = a.getAttribute("is") || a.localName,
                    d = styleCache$$module$$src$ShadyCSS.fetch(c, b.styleProperties, b.ownStylePropertyNames),
                    e = d ? d.styleElement : null,
                    f = b.scopeSelector;
                b.scopeSelector = d && d.scopeSelector || this._generateScopeSelector(c);
                e = module$$src$style_properties.StyleProperties.applyElementStyle(a, b.styleProperties, b.scopeSelector, e);
                this.nativeShadow || module$$src$style_properties.StyleProperties.applyElementScopeSelector(a,
                    b.scopeSelector, f);
                d || styleCache$$module$$src$ShadyCSS.store(c, b.styleProperties, e, b.scopeSelector);
                return e
            },
            _updateProperties: function(a, b) {
                var c = this._styleOwnerForNode(a),
                    d = module$$src$style_info.default.get(c),
                    c = Object.create(d.styleProperties || null),
                    e = module$$src$style_properties.StyleProperties.hostAndRootPropertiesForScope(a, b.styleRules);
                a = module$$src$style_properties.StyleProperties.propertyDataFromStyles(d.styleRules, a).properties;
                Object.assign(c, e.hostProps, a, e.rootProps);
                this._mixinOverrideStyles(c,
                    b.overrideStyleProperties);
                module$$src$style_properties.StyleProperties.reify(c);
                b.styleProperties = c
            },
            _mixinOverrideStyles: function(a, b) {
                for (var c in b) {
                    var d = b[c];
                    if (d || 0 === d) a[c] = d
                }
            },
            _updateNativeProperties: function(a, b) {
                for (var c in b) null === c ? a.style.removeProperty(c) : a.style.setProperty(c, b[c])
            },
            updateStyles: function(a) {
                window.CustomStyle && (window.CustomStyle._documentDirty = !0);
                this.applyStyle(this._documentOwner, a)
            },
            _transformCustomStyleForDocument: function(a) {
                var b = this,
                    c = module$$src$style_util.rulesForStyle(a);
                module$$src$style_util.forEachRule(c, function(a) {
                    module$$src$style_settings.nativeShadow ? module$$src$style_transformer.StyleTransformer.normalizeRootSelector(a) : module$$src$style_transformer.StyleTransformer.documentRule(a);
                    b.nativeCss && !b.nativeCssApply && module$$src$apply_shim.default.transformRule(a)
                });
                this.nativeCss ? a.textContent = module$$src$style_util.toCssText(c) : this._documentOwnerStyleInfo.styleRules.rules.push(c)
            },
            _revalidateApplyShim: function(a) {
                if (this.nativeCss && !this.nativeCssApply) {
                    var b =
                        module$$src$style_util.rulesForStyle(a);
                    module$$src$apply_shim.default.transformRules(b);
                    a.textContent = module$$src$style_util.toCssText(b)
                }
            },
            _applyCustomStyleToDocument: function(a) {
                this.nativeCss || module$$src$style_properties.StyleProperties.applyCustomStyle(a, this._documentOwnerStyleInfo.styleProperties)
            },
            getComputedStyleValue: function(a, b) {
                var c;
                this.nativeCss || (c = (module$$src$style_info.default.get(a) || module$$src$style_info.default.get(this._styleOwnerForNode(a))).styleProperties[b]);
                c = c || window.getComputedStyle(a).getPropertyValue(b);
                return c.trim()
            }
        };
    window.ShadyCSS = ShadyCSS$$module$$src$ShadyCSS;
    module$$src$ShadyCSS.ShadyCSS = ShadyCSS$$module$$src$ShadyCSS;
    var ShadyCSS = window.ShadyCSS,
        enqueued = !1,
        customStyles = [],
        hookFn = null;

    function enqueueDocumentValidation() {
        enqueued || (enqueued = !0, window.HTMLImports ? window.HTMLImports.whenReady(validateDocument) : "complete" === document.readyState ? requestAnimationFrame(validateDocument) : document.addEventListener("readystatechange", function() {
            "complete" === document.readyState && validateDocument()
        }))
    }
    enqueueDocumentValidation();

    function validateDocument() {
        enqueued && (ShadyCSS.updateStyles(), enqueued = !1)
    }

    function CustomStyle() {
        var a = window.Reflect && Reflect.construct ? Reflect.construct(HTMLElement, [], this.constructor || CustomStyle) : HTMLElement.call(this);
        customStyles.push(a);
        enqueueDocumentValidation();
        return a
    }
    Object.defineProperties(CustomStyle, {
        processHook: {
            get: function() {
                return hookFn
            },
            set: function(a) {
                return hookFn = a
            }
        },
        _customStyles: {
            get: function() {
                return customStyles
            }
        },
        _documentDirty: {
            get: function() {
                return enqueued
            },
            set: function(a) {
                return enqueued = a
            }
        }
    });
    CustomStyle.findStyles = function() {
        for (var a = 0; a < customStyles.length; a++) customStyles[a]._findStyle()
    };
    CustomStyle._revalidateApplyShim = function() {
        for (var a = 0; a < customStyles.length; a++) {
            var b = customStyles[a];
            b._style && ShadyCSS._revalidateApplyShim(b._style)
        }
    };
    CustomStyle.applyStyles = function() {
        for (var a = 0; a < customStyles.length; a++) customStyles[a]._applyStyle()
    };
    CustomStyle.prototype = Object.create(HTMLElement.prototype, {
        constructor: {
            value: CustomStyle,
            configurable: !0,
            writable: !0
        }
    });
    CustomStyle.prototype._findStyle = function() {
        if (!this._style) {
            var a = this.querySelector("style");
            if (a) {
                if (a.__appliedElement)
                    for (var b = 0; b < a.attributes.length; b++) {
                        var c = a.attributes[b];
                        a.__appliedElement.setAttribute(c.name, c.value)
                    }
                this._style = a.__appliedElement || a;
                hookFn && hookFn(this._style);
                ShadyCSS._transformCustomStyleForDocument(this._style)
            }
        }
    };
    CustomStyle.prototype._applyStyle = function() {
        this._style && ShadyCSS._applyCustomStyleToDocument(this._style)
    };
    // window.customElements.define("custom-style",CustomStyle);
    document.registerElement("custom-style", CustomStyle);
    window.CustomStyle = CustomStyle;
}).call(this)