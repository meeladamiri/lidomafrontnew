/* eslint-disable @next/next/next-script-for-ga */
import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
import { PROJECTNAME } from "@/configs/info";

interface IProps {
  styleTags: unknown;
}

export default class MyDocument extends Document<IProps> {
  render() {
    // const isDev = process.env.NODE_ENV === "development";
    // lang takes a BCP 47 tag: "fa", not the "fa_IR" locale form (that belongs
    // in og:locale, where it already is).
    return (
      <Html dir="rtl" lang="fa" id="html">
        <Head>
          {/* Dev-only debugging aids:
              1) __earlyErrs collects every early error/rejection (incl. failed
                 resource loads) before any Next chunk runs — hydration failures
                 in this codebase are otherwise silent.
              2) requestAnimationFrame fallback: Next's dev client gates
                 hydration behind a rAF (displayContent), which never fires in a
                 background/occluded tab — automated-browser verification hangs
                 without this. Timeout path only fires when real rAF doesn't.
              3) __reactErrs keeps React's own console.error text. React logs
                 the *reason* for a hydration mismatch once, before the generic
                 "Hydration failed" throw, and it scrolls out of the console
                 buffer behind the throw's repeats. Read window.__reactErrs[0]
                 to see which prop or element actually diverged. */}
          {process.env.NODE_ENV === "development" && (
            <script
              dangerouslySetInnerHTML={{
                __html: `window.__reactErrs=[];(function(){var _e=console.error;console.error=function(){try{window.__reactErrs.push(Array.prototype.slice.call(arguments).map(function(a){return typeof a==='string'?a:(a&&a.message)||String(a)}).join(' ').slice(0,600))}catch(e){}return _e.apply(console,arguments)}})();
window.__earlyErrs=[];window.addEventListener('error',function(e){var t=e.target||{};window.__earlyErrs.push(e.message?(e.message+' @ '+((e.filename||'').split('/').pop())+':'+e.lineno):('RESOURCE-FAIL '+(t.tagName||'?')+' '+(t.src||t.href||'?')))},true);window.addEventListener('unhandledrejection',function(e){window.__earlyErrs.push('REJECTION: '+String(e.reason&&(e.reason.stack||e.reason.message)||e.reason).slice(0,400))});
var _raf=window.requestAnimationFrame&&window.requestAnimationFrame.bind(window);window.requestAnimationFrame=function(cb){var done=false;function run(ts){if(done)return;done=true;cb(ts)}var t=setTimeout(function(){run(performance.now())},120);if(_raf)_raf(function(ts){clearTimeout(t);run(ts)});return t};`,
              }}
            />
          )}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-TFLHQ77');`,
            }}
          />

          <meta name="msapplication-TileColor" content="#03D6BB" />
          <meta name="msapplication-tap-highlight" content="no" />
          <meta name="theme-color" content={"#03D6BB"} />
          <meta name="application-name" content={PROJECTNAME} />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content={PROJECTNAME} />
          <meta name="format-detection" content="telephone=no" />

          <link rel="manifest" href="/manifest.json" />

          <link rel="apple-touch-icon" sizes="152x152" href="/pwa-icons/touch-icon-ipad.png" />
          <link
            rel="apple-touch-icon"
            sizes="167x167"
            href="/pwa-icons/touch-icon-ipad-retina.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/pwa-icons/touch-icon-iphone-retina.png"
          />
          {/* 192x192 */}
          <link rel="apple-touch-icon" href="/pwa-icons/touch-icon-iphone.png" />

          <link rel="icon" type="image/png" sizes="32x32" href="/pwa-icons/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/pwa-icons/favicon-16x16.png" />

          <link rel="preconnect" href="https://www.googletagmanager.com" />
          <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
          <link rel="preconnect" href="https://www.google-analytics.com" />
          <link rel="dns-prefetch" href="https://www.google-analytics.com" />
          {/* <link rel="dns-prefetch" href="https://storage.lidoma.com" /> */}

          {/*  */}
          {/* <script
            dangerouslySetInnerHTML={{
              __html: `
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "ad79lmniyq");
          `,
            }}
          />
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          ></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
            }}
          /> */}
          {/*  */}
        </Head>

        <body>
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-TFLHQ77"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            ></iframe>
          </noscript>

          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
