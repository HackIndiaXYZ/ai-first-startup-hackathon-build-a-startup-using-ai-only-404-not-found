// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (
  modules,
  entry,
  mainEntry,
  parcelRequireName,
  externals,
  distDir,
  publicUrl,
  devServer
) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var importMap = previousRequire.i || {};
  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        if (externals[name]) {
          return externals[name];
        }
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        globalObject
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      if (res === false) {
        return {};
      }
      // Synthesize a module to follow re-exports.
      if (Array.isArray(res)) {
        var m = {__esModule: true};
        res.forEach(function (v) {
          var key = v[0];
          var id = v[1];
          var exp = v[2] || v[0];
          var x = newRequire(id);
          if (key === '*') {
            Object.keys(x).forEach(function (key) {
              if (
                key === 'default' ||
                key === '__esModule' ||
                Object.prototype.hasOwnProperty.call(m, key)
              ) {
                return;
              }

              Object.defineProperty(m, key, {
                enumerable: true,
                get: function () {
                  return x[key];
                },
              });
            });
          } else if (exp === '*') {
            Object.defineProperty(m, key, {
              enumerable: true,
              value: x,
            });
          } else {
            Object.defineProperty(m, key, {
              enumerable: true,
              get: function () {
                if (exp === 'default') {
                  return x.__esModule ? x.default : x;
                }
                return x[exp];
              },
            });
          }
        });
        return m;
      }
      return newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.require = nodeRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.distDir = distDir;
  newRequire.publicUrl = publicUrl;
  newRequire.devServer = devServer;
  newRequire.i = importMap;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  // Only insert newRequire.load when it is actually used.
  // The code in this file is linted against ES5, so dynamic import is not allowed.
  // INSERT_LOAD_HERE

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });
    }
  }
})({"8w2Fv":[function(require,module,exports,__globalThis) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SERVER_PORT = 9024;
var HMR_SECURE = false;
var HMR_ENV_HASH = "439701173a9199ea";
var HMR_USE_SSE = false;
module.bundle.HMR_BUNDLE_ID = "62088a896528c13b";
"use strict";
/* global HMR_HOST, HMR_PORT, HMR_SERVER_PORT, HMR_ENV_HASH, HMR_SECURE, HMR_USE_SSE, chrome, browser, __parcel__import__, __parcel__importScripts__, ServiceWorkerGlobalScope */ /*::
import type {
  HMRAsset,
  HMRMessage,
} from '@parcel/reporter-dev-server/src/HMRServer.js';
interface ParcelRequire {
  (string): mixed;
  cache: {|[string]: ParcelModule|};
  hotData: {|[string]: mixed|};
  Module: any;
  parent: ?ParcelRequire;
  isParcelRequire: true;
  modules: {|[string]: [Function, {|[string]: string|}]|};
  HMR_BUNDLE_ID: string;
  root: ParcelRequire;
}
interface ParcelModule {
  hot: {|
    data: mixed,
    accept(cb: (Function) => void): void,
    dispose(cb: (mixed) => void): void,
    // accept(deps: Array<string> | string, cb: (Function) => void): void,
    // decline(): void,
    _acceptCallbacks: Array<(Function) => void>,
    _disposeCallbacks: Array<(mixed) => void>,
  |};
}
interface ExtensionContext {
  runtime: {|
    reload(): void,
    getURL(url: string): string;
    getManifest(): {manifest_version: number, ...};
  |};
}
declare var module: {bundle: ParcelRequire, ...};
declare var HMR_HOST: string;
declare var HMR_PORT: string;
declare var HMR_SERVER_PORT: string;
declare var HMR_ENV_HASH: string;
declare var HMR_SECURE: boolean;
declare var HMR_USE_SSE: boolean;
declare var chrome: ExtensionContext;
declare var browser: ExtensionContext;
declare var __parcel__import__: (string) => Promise<void>;
declare var __parcel__importScripts__: (string) => Promise<void>;
declare var globalThis: typeof self;
declare var ServiceWorkerGlobalScope: Object;
*/ var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
    OldModule.call(this, moduleName);
    this.hot = {
        data: module.bundle.hotData[moduleName],
        _acceptCallbacks: [],
        _disposeCallbacks: [],
        accept: function(fn) {
            this._acceptCallbacks.push(fn || function() {});
        },
        dispose: function(fn) {
            this._disposeCallbacks.push(fn);
        }
    };
    module.bundle.hotData[moduleName] = undefined;
}
module.bundle.Module = Module;
module.bundle.hotData = {};
var checkedAssets /*: {|[string]: boolean|} */ , disposedAssets /*: {|[string]: boolean|} */ , assetsToDispose /*: Array<[ParcelRequire, string]> */ , assetsToAccept /*: Array<[ParcelRequire, string]> */ , bundleNotFound = false;
function getHostname() {
    return HMR_HOST || (typeof location !== 'undefined' && location.protocol.indexOf('http') === 0 ? location.hostname : 'localhost');
}
function getPort() {
    return HMR_PORT || (typeof location !== 'undefined' ? location.port : HMR_SERVER_PORT);
}
// eslint-disable-next-line no-redeclare
let WebSocket = globalThis.WebSocket;
if (!WebSocket && typeof module.bundle.root === 'function') try {
    // eslint-disable-next-line no-global-assign
    WebSocket = module.bundle.root('ws');
} catch  {
// ignore.
}
var hostname = getHostname();
var port = getPort();
var protocol = HMR_SECURE || typeof location !== 'undefined' && location.protocol === 'https:' && ![
    'localhost',
    '127.0.0.1',
    '0.0.0.0'
].includes(hostname) ? 'wss' : 'ws';
// eslint-disable-next-line no-redeclare
var parent = module.bundle.parent;
if (!parent || !parent.isParcelRequire) {
    // Web extension context
    var extCtx = typeof browser === 'undefined' ? typeof chrome === 'undefined' ? null : chrome : browser;
    // Safari doesn't support sourceURL in error stacks.
    // eval may also be disabled via CSP, so do a quick check.
    var supportsSourceURL = false;
    try {
        (0, eval)('throw new Error("test"); //# sourceURL=test.js');
    } catch (err) {
        supportsSourceURL = err.stack.includes('test.js');
    }
    var ws;
    if (HMR_USE_SSE) ws = new EventSource('/__parcel_hmr');
    else try {
        // If we're running in the dev server's node runner, listen for messages on the parent port.
        let { workerData, parentPort } = module.bundle.root('node:worker_threads') /*: any*/ ;
        if (workerData !== null && workerData !== void 0 && workerData.__parcel) {
            parentPort.on('message', async (message)=>{
                try {
                    await handleMessage(message);
                    parentPort.postMessage('updated');
                } catch  {
                    parentPort.postMessage('restart');
                }
            });
            // After the bundle has finished running, notify the dev server that the HMR update is complete.
            queueMicrotask(()=>parentPort.postMessage('ready'));
        }
    } catch  {
        if (typeof WebSocket !== 'undefined') try {
            ws = new WebSocket(protocol + '://' + hostname + (port ? ':' + port : '') + '/');
        } catch (err) {
            // Ignore cloudflare workers error.
            if (err.message && !err.message.includes('Disallowed operation called within global scope')) console.error(err.message);
        }
    }
    if (ws) {
        // $FlowFixMe
        ws.onmessage = async function(event /*: {data: string, ...} */ ) {
            var data /*: HMRMessage */  = JSON.parse(event.data);
            await handleMessage(data);
        };
        if (ws instanceof WebSocket) {
            ws.onerror = function(e) {
                if (e.message) console.error(e.message);
            };
            ws.onclose = function() {
                console.warn("[parcel] \uD83D\uDEA8 Connection to the HMR server was lost");
            };
        }
    }
}
async function handleMessage(data /*: HMRMessage */ ) {
    checkedAssets = {} /*: {|[string]: boolean|} */ ;
    disposedAssets = {} /*: {|[string]: boolean|} */ ;
    assetsToAccept = [];
    assetsToDispose = [];
    bundleNotFound = false;
    if (data.type === 'reload') fullReload();
    else if (data.type === 'update') {
        // Remove error overlay if there is one
        if (typeof document !== 'undefined') removeErrorOverlay();
        let assets = data.assets;
        // Handle HMR Update
        let handled = assets.every((asset)=>{
            return asset.type === 'css' || asset.type === 'js' && hmrAcceptCheck(module.bundle.root, asset.id, asset.depsByBundle);
        });
        // Dispatch a custom event in case a bundle was not found. This might mean
        // an asset on the server changed and we should reload the page. This event
        // gives the client an opportunity to refresh without losing state
        // (e.g. via React Server Components). If e.preventDefault() is not called,
        // we will trigger a full page reload.
        if (handled && bundleNotFound && assets.some((a)=>a.envHash !== HMR_ENV_HASH) && typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') handled = !window.dispatchEvent(new CustomEvent('parcelhmrreload', {
            cancelable: true
        }));
        if (handled) {
            console.clear();
            // Dispatch custom event so other runtimes (e.g React Refresh) are aware.
            if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') window.dispatchEvent(new CustomEvent('parcelhmraccept'));
            await hmrApplyUpdates(assets);
            hmrDisposeQueue();
            // Run accept callbacks. This will also re-execute other disposed assets in topological order.
            let processedAssets = {};
            for(let i = 0; i < assetsToAccept.length; i++){
                let id = assetsToAccept[i][1];
                if (!processedAssets[id]) {
                    hmrAccept(assetsToAccept[i][0], id);
                    processedAssets[id] = true;
                }
            }
        } else fullReload();
    }
    if (data.type === 'error') {
        // Log parcel errors to console
        for (let ansiDiagnostic of data.diagnostics.ansi){
            let stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
            console.error("\uD83D\uDEA8 [parcel]: " + ansiDiagnostic.message + '\n' + stack + '\n\n' + ansiDiagnostic.hints.join('\n'));
        }
        if (typeof document !== 'undefined') {
            // Render the fancy html overlay
            removeErrorOverlay();
            var overlay = createErrorOverlay(data.diagnostics.html);
            // $FlowFixMe
            document.body.appendChild(overlay);
        }
    }
}
function removeErrorOverlay() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.remove();
        console.log("[parcel] \u2728 Error resolved");
    }
}
function createErrorOverlay(diagnostics) {
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    let errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';
    for (let diagnostic of diagnostics){
        let stack = diagnostic.frames.length ? diagnostic.frames.reduce((p, frame)=>{
            return `${p}
<a href="${protocol === 'wss' ? 'https' : 'http'}://${hostname}:${port}/__parcel_launch_editor?file=${encodeURIComponent(frame.location)}" style="text-decoration: underline; color: #888" onclick="fetch(this.href); return false">${frame.location}</a>
${frame.code}`;
        }, '') : diagnostic.stack;
        errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          \u{1F6A8} ${diagnostic.message}
        </div>
        <pre>${stack}</pre>
        <div>
          ${diagnostic.hints.map((hint)=>"<div>\uD83D\uDCA1 " + hint + '</div>').join('')}
        </div>
        ${diagnostic.documentation ? `<div>\u{1F4DD} <a style="color: violet" href="${diagnostic.documentation}" target="_blank">Learn more</a></div>` : ''}
      </div>
    `;
    }
    errorHTML += '</div>';
    overlay.innerHTML = errorHTML;
    return overlay;
}
function fullReload() {
    if (typeof location !== 'undefined' && 'reload' in location) location.reload();
    else if (typeof extCtx !== 'undefined' && extCtx && extCtx.runtime && extCtx.runtime.reload) extCtx.runtime.reload();
    else try {
        let { workerData, parentPort } = module.bundle.root('node:worker_threads') /*: any*/ ;
        if (workerData !== null && workerData !== void 0 && workerData.__parcel) parentPort.postMessage('restart');
    } catch (err) {
        console.error("[parcel] \u26A0\uFE0F An HMR update was not accepted. Please restart the process.");
    }
}
function getParents(bundle, id) /*: Array<[ParcelRequire, string]> */ {
    var modules = bundle.modules;
    if (!modules) return [];
    var parents = [];
    var k, d, dep;
    for(k in modules)for(d in modules[k][1]){
        dep = modules[k][1][d];
        if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) parents.push([
            bundle,
            k
        ]);
    }
    if (bundle.parent) parents = parents.concat(getParents(bundle.parent, id));
    return parents;
}
function updateLink(link) {
    var href = link.getAttribute('href');
    if (!href) return;
    var newLink = link.cloneNode();
    newLink.onload = function() {
        if (link.parentNode !== null) // $FlowFixMe
        link.parentNode.removeChild(link);
    };
    newLink.setAttribute('href', // $FlowFixMe
    href.split('?')[0] + '?' + Date.now());
    // $FlowFixMe
    link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
    if (cssTimeout || typeof document === 'undefined') return;
    cssTimeout = setTimeout(function() {
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for(var i = 0; i < links.length; i++){
            // $FlowFixMe[incompatible-type]
            var href /*: string */  = links[i].getAttribute('href');
            var hostname = getHostname();
            var servedFromHMRServer = hostname === 'localhost' ? new RegExp('^(https?:\\/\\/(0.0.0.0|127.0.0.1)|localhost):' + getPort()).test(href) : href.indexOf(hostname + ':' + getPort());
            var absolute = /^https?:\/\//i.test(href) && href.indexOf(location.origin) !== 0 && !servedFromHMRServer;
            if (!absolute) updateLink(links[i]);
        }
        cssTimeout = null;
    }, 50);
}
function hmrDownload(asset) {
    if (asset.type === 'js') {
        if (typeof document !== 'undefined') {
            let script = document.createElement('script');
            script.src = asset.url + '?t=' + Date.now();
            if (asset.outputFormat === 'esmodule') script.type = 'module';
            return new Promise((resolve, reject)=>{
                var _document$head;
                script.onload = ()=>resolve(script);
                script.onerror = reject;
                (_document$head = document.head) === null || _document$head === void 0 || _document$head.appendChild(script);
            });
        } else if (typeof importScripts === 'function') {
            // Worker scripts
            if (asset.outputFormat === 'esmodule') return import(asset.url + '?t=' + Date.now());
            else return new Promise((resolve, reject)=>{
                try {
                    importScripts(asset.url + '?t=' + Date.now());
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }
    }
}
async function hmrApplyUpdates(assets) {
    global.parcelHotUpdate = Object.create(null);
    let scriptsToRemove;
    try {
        // If sourceURL comments aren't supported in eval, we need to load
        // the update from the dev server over HTTP so that stack traces
        // are correct in errors/logs. This is much slower than eval, so
        // we only do it if needed (currently just Safari).
        // https://bugs.webkit.org/show_bug.cgi?id=137297
        // This path is also taken if a CSP disallows eval.
        if (!supportsSourceURL) {
            let promises = assets.map((asset)=>{
                var _hmrDownload;
                return (_hmrDownload = hmrDownload(asset)) === null || _hmrDownload === void 0 ? void 0 : _hmrDownload.catch((err)=>{
                    // Web extension fix
                    if (extCtx && extCtx.runtime && extCtx.runtime.getManifest().manifest_version == 3 && typeof ServiceWorkerGlobalScope != 'undefined' && global instanceof ServiceWorkerGlobalScope) {
                        extCtx.runtime.reload();
                        return;
                    }
                    throw err;
                });
            });
            scriptsToRemove = await Promise.all(promises);
        }
        assets.forEach(function(asset) {
            hmrApply(module.bundle.root, asset);
        });
    } finally{
        delete global.parcelHotUpdate;
        if (scriptsToRemove) scriptsToRemove.forEach((script)=>{
            if (script) {
                var _document$head2;
                (_document$head2 = document.head) === null || _document$head2 === void 0 || _document$head2.removeChild(script);
            }
        });
    }
}
function hmrApply(bundle /*: ParcelRequire */ , asset /*:  HMRAsset */ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (asset.type === 'css') reloadCSS();
    else if (asset.type === 'js') {
        let deps = asset.depsByBundle[bundle.HMR_BUNDLE_ID];
        if (deps) {
            if (modules[asset.id]) {
                // Remove dependencies that are removed and will become orphaned.
                // This is necessary so that if the asset is added back again, the cache is gone, and we prevent a full page reload.
                let oldDeps = modules[asset.id][1];
                for(let dep in oldDeps)if (!deps[dep] || deps[dep] !== oldDeps[dep]) {
                    let id = oldDeps[dep];
                    let parents = getParents(module.bundle.root, id);
                    if (parents.length === 1) hmrDelete(module.bundle.root, id);
                }
            }
            if (supportsSourceURL) // Global eval. We would use `new Function` here but browser
            // support for source maps is better with eval.
            (0, eval)(asset.output);
            // $FlowFixMe
            let fn = global.parcelHotUpdate[asset.id];
            modules[asset.id] = [
                fn,
                deps
            ];
        }
        // Always traverse to the parent bundle, even if we already replaced the asset in this bundle.
        // This is required in case modules are duplicated. We need to ensure all instances have the updated code.
        if (bundle.parent) hmrApply(bundle.parent, asset);
    }
}
function hmrDelete(bundle, id) {
    let modules = bundle.modules;
    if (!modules) return;
    if (modules[id]) {
        // Collect dependencies that will become orphaned when this module is deleted.
        let deps = modules[id][1];
        let orphans = [];
        for(let dep in deps){
            let parents = getParents(module.bundle.root, deps[dep]);
            if (parents.length === 1) orphans.push(deps[dep]);
        }
        // Delete the module. This must be done before deleting dependencies in case of circular dependencies.
        delete modules[id];
        delete bundle.cache[id];
        // Now delete the orphans.
        orphans.forEach((id)=>{
            hmrDelete(module.bundle.root, id);
        });
    } else if (bundle.parent) hmrDelete(bundle.parent, id);
}
function hmrAcceptCheck(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    checkedAssets = {};
    if (hmrAcceptCheckOne(bundle, id, depsByBundle)) return true;
    // Traverse parents breadth first. All possible ancestries must accept the HMR update, or we'll reload.
    let parents = getParents(module.bundle.root, id);
    let accepted = false;
    while(parents.length > 0){
        let v = parents.shift();
        let a = hmrAcceptCheckOne(v[0], v[1], null);
        if (a) // If this parent accepts, stop traversing upward, but still consider siblings.
        accepted = true;
        else if (a !== null) {
            // Otherwise, queue the parents in the next level upward.
            let p = getParents(module.bundle.root, v[1]);
            if (p.length === 0) {
                // If there are no parents, then we've reached an entry without accepting. Reload.
                accepted = false;
                break;
            }
            parents.push(...p);
        }
    }
    return accepted;
}
function hmrAcceptCheckOne(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
        // If we reached the root bundle without finding where the asset should go,
        // there's nothing to do. Mark as "accepted" so we don't reload the page.
        if (!bundle.parent) {
            bundleNotFound = true;
            return true;
        }
        return hmrAcceptCheckOne(bundle.parent, id, depsByBundle);
    }
    if (checkedAssets[id]) return null;
    checkedAssets[id] = true;
    var cached = bundle.cache[id];
    if (!cached) return true;
    assetsToDispose.push([
        bundle,
        id
    ]);
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
        assetsToAccept.push([
            bundle,
            id
        ]);
        return true;
    }
    return false;
}
function hmrDisposeQueue() {
    // Dispose all old assets.
    for(let i = 0; i < assetsToDispose.length; i++){
        let id = assetsToDispose[i][1];
        if (!disposedAssets[id]) {
            hmrDispose(assetsToDispose[i][0], id);
            disposedAssets[id] = true;
        }
    }
    assetsToDispose = [];
}
function hmrDispose(bundle /*: ParcelRequire */ , id /*: string */ ) {
    var cached = bundle.cache[id];
    bundle.hotData[id] = {};
    if (cached && cached.hot) cached.hot.data = bundle.hotData[id];
    if (cached && cached.hot && cached.hot._disposeCallbacks.length) cached.hot._disposeCallbacks.forEach(function(cb) {
        cb(bundle.hotData[id]);
    });
    delete bundle.cache[id];
}
function hmrAccept(bundle /*: ParcelRequire */ , id /*: string */ ) {
    // Execute the module.
    bundle(id);
    // Run the accept callbacks in the new version of the module.
    var cached = bundle.cache[id];
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
        let assetsToAlsoAccept = [];
        cached.hot._acceptCallbacks.forEach(function(cb) {
            let additionalAssets = cb(function() {
                return getParents(module.bundle.root, id);
            });
            if (Array.isArray(additionalAssets) && additionalAssets.length) assetsToAlsoAccept.push(...additionalAssets);
        });
        if (assetsToAlsoAccept.length) {
            let handled = assetsToAlsoAccept.every(function(a) {
                return hmrAcceptCheck(a[0], a[1]);
            });
            if (!handled) return fullReload();
            hmrDisposeQueue();
        }
    }
}

},{}],"6kb64":[function(require,module,exports,__globalThis) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
var _utils = require("./utils");
var _lenis = require("@studio-freight/lenis");
var _lenisDefault = parcelHelpers.interopDefault(_lenis);
var _gsap = require("gsap");
var _scrollTrigger = require("gsap/ScrollTrigger");
var _splittingCss = require("splitting/dist/splitting.css");
var _splittingCellsCss = require("splitting/dist/splitting-cells.css");
var _splitting = require("splitting");
var _splittingDefault = parcelHelpers.interopDefault(_splitting);
(0, _gsap.gsap).registerPlugin((0, _scrollTrigger.ScrollTrigger));
const wrapElements = (elems, wrapType, wrapClass)=>{
    elems.forEach((char)=>{
        const wrapEl = document.createElement(wrapType);
        wrapEl.classList = wrapClass;
        char.parentNode.appendChild(wrapEl);
        wrapEl.appendChild(char);
    });
};
(0, _splittingDefault.default)();
const fx1Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect1]')
];
const fx2Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect2]')
];
const fx3Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect3]')
];
const fx4Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect4]')
];
const fx5Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect5]')
];
const fx6Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect6]')
];
const fx7Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect7]')
];
const fx8Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect8]')
];
const fx9Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect9]')
];
const fx10Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect10]')
];
const fx11Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect11]')
];
const fx12Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect12]')
];
const fx13Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect13]')
];
const fx14Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect14]')
];
const fx15Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect15]')
];
// Lenis smooth scrolling
let lenis;
// Initialize Lenis smooth scrolling
const initSmoothScrolling = ()=>{
    lenis = new (0, _lenisDefault.default)({
        lerp: 0.2,
        smooth: true
    });
    lenis.on('scroll', ()=>(0, _scrollTrigger.ScrollTrigger).update());
    const scrollFn = (time)=>{
        lenis.raf(time);
        requestAnimationFrame(scrollFn);
    };
    requestAnimationFrame(scrollFn);
};
// GSAP Scroll Triggers
const scroll = ()=>{
    fx1Titles.forEach((title)=>{
        const chars = title.querySelectorAll('.char');
        (0, _gsap.gsap).fromTo(chars, {
            'will-change': 'opacity, transform',
            opacity: 0,
            scale: 0.6,
            rotationZ: ()=>(0, _gsap.gsap).utils.random(-20, 20)
        }, {
            ease: 'power4',
            opacity: 1,
            scale: 1,
            rotation: 0,
            stagger: 0.4,
            scrollTrigger: {
                trigger: title,
                start: 'center+=20% bottom',
                end: '+=50%',
                scrub: true
            }
        });
    });
    fx2Titles.forEach((title)=>{
        const chars = title.querySelectorAll('.char');
        (0, _gsap.gsap).fromTo(chars, {
            'will-change': 'opacity, transform',
            opacity: 0,
            yPercent: 120,
            scaleY: 2.3,
            scaleX: 0.7,
            transformOrigin: '50% 0%'
        }, {
            duration: 1,
            ease: 'back.inOut(2)',
            opacity: 1,
            yPercent: 0,
            scaleY: 1,
            scaleX: 1,
            stagger: 0.03,
            scrollTrigger: {
                trigger: title,
                start: 'center bottom+=50%',
                end: 'bottom top+=40%',
                scrub: true
            }
        });
    });
    fx3Titles.forEach((title)=>{
        const chars = title.querySelectorAll('.char');
        (0, _gsap.gsap).fromTo(chars, {
            'will-change': 'transform',
            transformOrigin: '50% 0%',
            scaleY: 0
        }, {
            ease: 'back',
            opacity: 1,
            scaleY: 1,
            yPercent: 0,
            stagger: 0.03,
            scrollTrigger: {
                trigger: title,
                start: 'center bottom-=5%',
                end: 'top top-=20%',
                scrub: true
            }
        });
    });
    fx4Titles.forEach((title)=>{
        const words = title.querySelectorAll('.word');
        for (const word of words){
            const chars = word.querySelectorAll('.char');
            (0, _gsap.gsap).fromTo(chars, {
                'will-change': 'opacity, transform',
                x: (position, _, arr)=>150 * (position - arr.length / 2)
            }, {
                ease: 'power1.inOut',
                x: 0,
                stagger: {
                    grid: 'auto',
                    from: 'center'
                },
                scrollTrigger: {
                    trigger: word,
                    start: 'center bottom+=30%',
                    end: 'top top+=15%',
                    scrub: true
                }
            });
        }
    });
    fx5Titles.forEach((title)=>{
        const chars = title.querySelectorAll('.char');
        (0, _gsap.gsap).fromTo(chars, {
            'will-change': 'opacity, transform',
            opacity: 0,
            xPercent: ()=>(0, _gsap.gsap).utils.random(-200, 200),
            yPercent: ()=>(0, _gsap.gsap).utils.random(-150, 150)
        }, {
            ease: 'power1.inOut',
            opacity: 1,
            xPercent: 0,
            yPercent: 0,
            stagger: {
                each: 0.05,
                grid: 'auto',
                from: 'random'
            },
            scrollTrigger: {
                trigger: title,
                start: 'center bottom+=10%',
                end: 'bottom center',
                scrub: 0.9
            }
        });
    });
    fx6Titles.forEach((title)=>{
        const words = title.querySelectorAll('.word');
        for (const word of words){
            const chars = word.querySelectorAll('.char');
            chars.forEach((char)=>(0, _gsap.gsap).set(char.parentNode, {
                    perspective: 2000
                }));
            (0, _gsap.gsap).fromTo(chars, {
                'will-change': 'opacity, transform',
                opacity: 0,
                rotationX: -90,
                yPercent: 50
            }, {
                ease: 'power1.inOut',
                opacity: 1,
                rotationX: 0,
                yPercent: 0,
                stagger: {
                    each: 0.03,
                    from: 0
                },
                scrollTrigger: {
                    trigger: word,
                    start: 'center bottom+=40%',
                    end: 'bottom center-=30%',
                    scrub: 0.9
                }
            });
        }
    });
    fx7Titles.forEach((title)=>{
        const words = title.querySelectorAll('.word');
        for (const word of words){
            const chars = word.querySelectorAll('.char');
            chars.forEach((char)=>(0, _gsap.gsap).set(char.parentNode, {
                    perspective: 2000
                }));
            (0, _gsap.gsap).fromTo(chars, {
                'will-change': 'opacity, transform',
                transformOrigin: '100% 50%',
                opacity: 0,
                rotationY: -90,
                z: -300
            }, {
                ease: 'expo',
                opacity: 1,
                rotationY: 0,
                z: 0,
                stagger: {
                    each: 0.06,
                    from: 'end'
                },
                scrollTrigger: {
                    trigger: word,
                    start: 'bottom bottom+=20%',
                    end: 'bottom top',
                    scrub: 1
                }
            });
        }
    });
    const lettersAndSymbols = [
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
        'i',
        'j',
        'k',
        'l',
        'm',
        'n',
        'o',
        'p',
        'q',
        'r',
        's',
        't',
        'u',
        'v',
        'w',
        'x',
        'y',
        'z',
        '!',
        '@',
        '#',
        '$',
        '%',
        '^',
        '&',
        '*',
        '-',
        '_',
        '+',
        '=',
        ';',
        ':',
        '<',
        '>',
        ','
    ];
    fx8Titles.forEach((title)=>{
        const chars = title.querySelectorAll('.char');
        chars.forEach((char, position)=>{
            let initialHTML = char.innerHTML;
            (0, _gsap.gsap).fromTo(char, {
                opacity: 0
            }, {
                duration: 0.03,
                innerHTML: ()=>lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)],
                repeat: 1,
                repeatRefresh: true,
                opacity: 1,
                repeatDelay: 0.03,
                delay: (position + 1) * 0.18,
                onComplete: ()=>(0, _gsap.gsap).set(char, {
                        innerHTML: initialHTML,
                        delay: 0.03
                    }),
                scrollTrigger: {
                    trigger: title,
                    start: 'top bottom',
                    end: 'bottom center',
                    toggleActions: "play resume resume reset",
                    onEnter: ()=>(0, _gsap.gsap).set(char, {
                            opacity: 0
                        })
                }
            });
        });
    });
    fx9Titles.forEach((title)=>{
        const words = title.querySelectorAll('.word');
        for (const word of words){
            const chars = word.querySelectorAll('.char');
            (0, _gsap.gsap).fromTo(chars, {
                'will-change': 'transform',
                scaleX: 0,
                x: (_, target)=>window.innerWidth / 2 - target.offsetLeft - target.offsetWidth / 2
            }, {
                ease: 'power1.inOut',
                scaleX: 1,
                x: 0,
                scrollTrigger: {
                    trigger: word,
                    start: 'top bottom',
                    end: 'top top',
                    scrub: true
                }
            });
        }
    });
    fx10Titles.forEach((title)=>{
        const chars = title.querySelectorAll('.char');
        (0, _gsap.gsap).fromTo(chars, {
            'will-change': 'opacity',
            opacity: 0,
            filter: 'blur(20px)'
        }, {
            duration: 0.25,
            ease: 'power1.inOut',
            opacity: 1,
            filter: 'blur(0px)',
            stagger: {
                each: 0.05,
                from: 'random'
            },
            scrollTrigger: {
                trigger: title,
                start: 'top bottom',
                end: 'center center',
                toggleActions: "play resume resume reset"
            }
        });
    });
    fx11Titles.forEach((title)=>{
        const chars = title.querySelectorAll('.char');
        wrapElements(chars, 'span', 'char-wrap');
        (0, _gsap.gsap).fromTo(chars, {
            'will-change': 'transform',
            transformOrigin: '0% 50%',
            xPercent: 105
        }, {
            duration: 1,
            ease: 'expo',
            xPercent: 0,
            stagger: 0.042,
            scrollTrigger: {
                trigger: title,
                start: 'top bottom',
                end: 'top top+=10%',
                toggleActions: "play resume resume reset"
            }
        });
    });
    fx12Titles.forEach((title)=>{
        const chars = title.querySelectorAll('.char');
        wrapElements(chars, 'span', 'char-wrap');
        (0, _gsap.gsap).fromTo(chars, {
            'will-change': 'transform',
            xPercent: -250,
            rotationZ: 45,
            scaleX: 6,
            transformOrigin: '100% 50%'
        }, {
            duration: 1,
            ease: 'power2',
            xPercent: 0,
            rotationZ: 0,
            scaleX: 1,
            stagger: -0.06,
            scrollTrigger: {
                trigger: title,
                start: 'top bottom+=10%',
                end: 'bottom top+=10%',
                scrub: true
            }
        });
    });
    fx13Titles.forEach((title)=>{
        const chars = title.querySelectorAll('.char');
        chars.forEach((char)=>(0, _gsap.gsap).set(char.parentNode, {
                perspective: 2000
            }));
        (0, _gsap.gsap).fromTo(chars, {
            'will-change': 'opacity, transform',
            opacity: 0,
            rotationY: 180,
            xPercent: -40,
            yPercent: 100
        }, {
            ease: 'power4.inOut()',
            opacity: 1,
            rotationY: 0,
            xPercent: 0,
            yPercent: 0,
            stagger: {
                each: -0.03,
                from: 0
            },
            scrollTrigger: {
                trigger: title,
                start: 'center bottom',
                end: 'bottom center-=30%',
                scrub: 0.9
            }
        });
    });
    fx14Titles.forEach((title)=>{
        const chars = title.querySelectorAll('.char');
        (0, _gsap.gsap).timeline().fromTo(title, {
            'will-change': 'transform',
            xPercent: 100
        }, {
            ease: 'none',
            xPercent: 0,
            scrollTrigger: {
                trigger: title,
                scrub: true,
                start: 'center center',
                end: '+=100%',
                pin: title.parentNode
            }
        }).fromTo(chars, {
            'will-change': 'transform',
            scale: 3,
            yPercent: -900
        }, {
            ease: 'back(2)',
            scale: 1,
            yPercent: 0,
            stagger: 0.05,
            scrollTrigger: {
                trigger: title,
                start: 'center center',
                end: '+=100%',
                scrub: 1.9
            }
        }, 0);
    });
    fx15Titles.forEach((title)=>{
        const chars = title.querySelectorAll('.char');
        chars.forEach((char)=>(0, _gsap.gsap).set(char.parentNode, {
                perspective: 2000
            }));
        (0, _gsap.gsap).timeline().fromTo(title, {
            'will-change': 'transform',
            xPercent: -80
        }, {
            ease: 'none',
            xPercent: 0,
            scrollTrigger: {
                trigger: title,
                scrub: true,
                start: 'center center',
                end: '+=100%',
                pin: title.parentNode
            }
        }).fromTo(chars, {
            'will-change': 'opacity, transform',
            transformOrigin: '50% 50% -200px',
            rotationX: 380,
            opacity: 0
        }, {
            ease: 'expo.inOut',
            rotationX: 0,
            z: 0,
            opacity: 1,
            stagger: -0.03,
            scrollTrigger: {
                trigger: title,
                start: 'center center',
                end: '+=140%',
                scrub: 1.2
            }
        }, 0);
    });
};
// Preload images and fonts
(0, _utils.preloadFonts)('cvn8slu').then(()=>{
    // Remove loader (loading class)
    document.body.classList.remove('loading');
    // Lenis (smooth scrolling)
    initSmoothScrolling();
    // GSAP Scroll Triggers
    scroll();
});

},{"./utils":"bMpAD","@studio-freight/lenis":"1tY0F","gsap":"9F7Z6","gsap/ScrollTrigger":"372oo","splitting/dist/splitting.css":"3uR7n","splitting/dist/splitting-cells.css":"7jeGL","splitting":"6m3bh","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"3uR7n":[function() {},{}],"7jeGL":[function() {},{}]},["8w2Fv","6kb64"], "6kb64", "parcelRequire2524", {})

//# sourceMappingURL=codrops_OnScrollTypographyAnimations.6528c13b.js.map
