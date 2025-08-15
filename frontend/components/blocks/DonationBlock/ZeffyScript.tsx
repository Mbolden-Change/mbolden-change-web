'use client';

import Script from 'next/script';

const ZeffyPopUpScript = `
    (() => {
        let e = "zeffy-form-link",
            t = "zeffy-iframe",
            i = "display: none; position: fixed; top: 0; bottom: 0; right: 0; left: 0; z-index: 10000; transition: opacity 0.25s ease-in-out; opacity: 0;";

        function a(e) {
        let t = new URL(e),
            i = new URLSearchParams(t.search);
        i.append("cachebust", Date.now());
        t.search = i.toString();
        return t.toString();
        }

        let n = document.querySelectorAll('iframe[src^="https://www.zeffy.com/"], iframe[src^="https://app.simplyk.io/"]');
        n.forEach(e => {
        e.src = a(e.src);
        });

        let o = document.querySelectorAll(\`[\${e}]\`);
        if (o.length > 0) {
        let s = {};
        o.forEach(t => {
            let i = t.getAttribute(e);
            if (i) {
            if (!s[i]) s[i] = [];
            s[i].push(t);
            }
        });

        let d = document.createElement("div");
        Object.assign(d, {
            style: "display: none; position: fixed; top: 0; bottom: 0; right: 0; left: 0; background-color: rgba(0,0,0,0.5); z-index: 10000; transition: opacity 0.25s ease-in-out; opacity: 0;",
            ariaHidden: "true"
        });
        document.body.append(d);

        Object.keys(s).forEach(e => {
            let n = document.createElement("div");
            Object.assign(n, { style: i, ariaHidden: "true" });

            let o = document.createElement("iframe");
            Object.assign(o, {
            title: "Form powered and secured by Zeffy",
            style: "width: 100%; height: 100%; border: none; border-radius: 4px;",
            src: a(e),
            allow: "payment"
            });
            n.append(o);

            let l = window.matchMedia("(min-width: 769px)");

            function r(e) {
            if (e.matches) {
                n.style.top = "5%";
                n.style.bottom = "5%";
                n.style.left = "10%";
                n.style.right = "10%";
            } else {
                n.style.top = 0;
                n.style.bottom = 0;
                n.style.left = 0;
                n.style.right = 0;
            }
            }

            function c() {
            d.style.display = "block";
            d.ariaHidden = "false";
            n.style.display = "block";
            n.ariaHidden = "false";
            setTimeout(() => {
                d.style.opacity = 1;
                n.style.opacity = 1;
            }, 1);
            }

            function y() {
            d.style.opacity = 0;
            n.style.opacity = 0;
            setTimeout(() => {
                d.style.display = "none";
                d.ariaHidden = "true";
                n.style.display = "none";
                n.ariaHidden = "true";
            }, 250);
            }

            l.addEventListener("change", r);
            r(l);

            document.body.append(n);
            d.addEventListener("click", () => { y() });

            s[e].forEach(t => {
            let iframeLoaded = false;

            o.addEventListener("load", () => {
            iframeLoaded = true;
            });

            t.addEventListener("click", () => {
            c();
            if (iframeLoaded) {
                o.contentWindow.postMessage({ id: t, open: !0 }, "*");
            } else {
                o.addEventListener("load", () => {
                o.contentWindow.postMessage({ id: t, open: !0 }, "*");
                }, { once: true });
            }
            });

            });

            window.addEventListener("keydown", e => {
            if (e.key === "Escape") y();
            });

            window.addEventListener("message", e => {
            if (e.isTrusted && e.data && e.data.id === t && e.data.close) {
                y();
            }
            }, false);
        });
        }
    })();
`;

export default function ZeffyScript() {
    return (
        <Script
        id="zeffy-popup-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: ZeffyPopUpScript }}
        />
    );
}
