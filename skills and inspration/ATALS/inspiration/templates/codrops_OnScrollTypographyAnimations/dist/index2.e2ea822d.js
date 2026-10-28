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
})({"c54Ky":[function(require,module,exports,__globalThis) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SERVER_PORT = 9024;
var HMR_SECURE = false;
var HMR_ENV_HASH = "439701173a9199ea";
var HMR_USE_SSE = false;
module.bundle.HMR_BUNDLE_ID = "3fdc8057e2ea822d";
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

},{}],"3RRCp":[function(require,module,exports,__globalThis) {
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
(0, _splittingDefault.default)();
const fx16Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect16]')
];
const fx17Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect17]')
];
const fx18Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect18]')
];
const fx19Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect19]')
];
const fx20Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect20]')
];
const fx21Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect21]')
];
const fx22Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect22]')
];
const fx23Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect23]')
];
const fx24Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect24]')
];
const fx25Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect25]')
];
const fx26Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect26]')
];
const fx27Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect27]')
];
const fx28Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect28]')
];
const fx29Titles = [
    ...document.querySelectorAll('.content__title[data-splitting][data-effect29]')
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
    fx16Titles.forEach((title)=>{
        (0, _gsap.gsap).fromTo(title, {
            transformOrigin: '0% 50%',
            rotate: 3
        }, {
            ease: 'none',
            rotate: 0,
            scrollTrigger: {
                trigger: title,
                start: 'top bottom',
                end: 'top top',
                scrub: true
            }
        });
        (0, _gsap.gsap).fromTo(title.querySelectorAll('.word'), {
            'will-change': 'opacity',
            opacity: 0.1
        }, {
            ease: 'none',
            opacity: 1,
            stagger: 0.05,
            scrollTrigger: {
                trigger: title,
                start: 'top bottom-=20%',
                end: 'center top+=20%',
                scrub: true
            }
        });
    });
    fx17Titles.forEach((title)=>{
        const chars = title.querySelectorAll('.char');
        chars.forEach((char)=>(0, _gsap.gsap).set(char.parentNode, {
                perspective: 1000
            }));
        (0, _gsap.gsap).fromTo(chars, {
            'will-change': 'opacity, transform',
            opacity: 0,
            rotateX: ()=>(0, _gsap.gsap).utils.random(-120, 120),
            z: ()=>(0, _gsap.gsap).utils.random(-200, 200)
        }, {
            ease: 'none',
            opacity: 1,
            rotateX: 0,
            z: 0,
            stagger: 0.02,
            scrollTrigger: {
                trigger: title,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    });
    fx18Titles.forEach((title)=>{
        const chars = title.querySelectorAll('.char');
        chars.forEach((char)=>(0, _gsap.gsap).set(char.parentNode, {
                perspective: 1000
            }));
        (0, _gsap.gsap).fromTo(chars, {
            'will-change': 'opacity, transform',
            opacity: 0.2,
            z: -800
        }, {
            ease: 'back.out(1.2)',
            opacity: 1,
            z: 0,
            stagger: 0.04,
            scrollTrigger: {
                trigger: title,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });
    });
    fx19Titles.forEach((title)=>{
        const chars = title.querySelectorAll('.char');
        chars.forEach((char)=>(0, _gsap.gsap).set(char.parentNode, {
                perspective: 1000
            }));
        (0, _gsap.gsap).fromTo(chars, {
            'will-change': 'opacity, transform',
            transformOrigin: '50% 0%',
            opacity: 0,
            rotationX: -90,
            z: -200
        }, {
            ease: 'power1',
            opacity: 1,
            stagger: 0.05,
            rotationX: 0,
            z: 0,
            scrollTrigger: {
                trigger: title,
                start: 'center bottom',
                end: 'bottom top+=20%',
                scrub: true
            }
        });
    });
    fx20Titles.forEach((title)=>{
        const chars = title.querySelectorAll('.char');
        chars.forEach((char)=>(0, _gsap.gsap).set(char.parentNode, {
                perspective: 1000
            }));
        (0, _gsap.gsap).fromTo(chars, {
            'will-change': 'opacity, transform',
            transformOrigin: '50% 100%',
            opacity: 0,
            rotationX: 90
        }, {
            ease: 'power4',
            opacity: 1,
            stagger: {
                each: 0.03,
                from: 'random'
            },
            rotationX: 0,
            scrollTrigger: {
                trigger: title,
                start: 'center bottom',
                end: 'bottom top+=20%',
                scrub: true
            }
        });
    });
    fx21Titles.forEach((title)=>{
        const words = [
            ...title.querySelectorAll('.word')
        ];
        for (const word of words){
            const chars = word.querySelectorAll('.char');
            chars.forEach((char)=>(0, _gsap.gsap).set(char.parentNode, {
                    perspective: 2000
                }));
            (0, _gsap.gsap).fromTo(chars, {
                'will-change': 'opacity, transform',
                opacity: 0,
                y: (position, _, arr)=>-40 * Math.abs(position - arr.length / 2),
                z: ()=>(0, _gsap.gsap).utils.random(-1500, -600),
                rotationX: ()=>(0, _gsap.gsap).utils.random(-500, -200)
            }, {
                ease: 'power1.inOut',
                opacity: 1,
                y: 0,
                z: 0,
                rotationX: 0,
                stagger: {
                    each: 0.06,
                    from: 'center'
                },
                scrollTrigger: {
                    trigger: word,
                    start: 'top bottom',
                    end: 'top top+=15%',
                    scrub: true
                }
            });
        }
    });
    fx22Titles.forEach((title)=>{
        const words = [
            ...title.querySelectorAll('.word')
        ];
        for (const word of words){
            const chars = word.querySelectorAll('.char');
            const charsTotal = chars.length;
            chars.forEach((char)=>(0, _gsap.gsap).set(char.parentNode, {
                    perspective: 1000
                }));
            (0, _gsap.gsap).fromTo(chars, {
                'will-change': 'transform',
                x: (position)=>{
                    const factor = position < Math.ceil(charsTotal / 2) ? position : Math.ceil(charsTotal / 2) - Math.abs(Math.floor(charsTotal / 2) - position) - 1;
                    return (charsTotal % 2 ? Math.abs(Math.ceil(charsTotal / 2) - 1 - factor) : Math.abs(Math.ceil(charsTotal / 2) - factor)) * 200 * (position < charsTotal / 2 ? -1 : 1);
                },
                y: (position)=>{
                    const factor = position < Math.ceil(charsTotal / 2) ? position : Math.ceil(charsTotal / 2) - Math.abs(Math.floor(charsTotal / 2) - position) - 1;
                    return factor * 60;
                },
                rotationY: -270,
                rotationZ: (position)=>{
                    const factor = position < Math.ceil(charsTotal / 2) ? position : Math.ceil(charsTotal / 2) - Math.abs(Math.floor(charsTotal / 2) - position) - 1;
                    return position < charsTotal / 2 ? Math.abs(factor - charsTotal / 2) * 8 : -1 * Math.abs(factor - charsTotal / 2) * 8;
                }
            }, {
                ease: 'power2.inOut',
                x: 0,
                y: 0,
                rotationZ: 0,
                rotationY: 0,
                scale: 1,
                scrollTrigger: {
                    trigger: word,
                    start: 'top bottom+=40%',
                    end: 'top top+=15%',
                    scrub: true
                }
            });
        }
    });
    fx23Titles.forEach((title)=>{
        const words = [
            ...title.querySelectorAll('.word')
        ];
        for (const [wordPosition, word] of words.entries())(0, _gsap.gsap).fromTo(word.querySelectorAll('.char'), {
            'will-change': 'transform',
            scale: 0.01,
            x: (pos, _, arr)=>{
                return wordPosition % 2 ? pos * 50 : (arr.length - pos - 1) * -50;
            }
        }, {
            ease: 'power4',
            scale: 1,
            x: 0,
            scrollTrigger: {
                trigger: word,
                start: 'center bottom',
                end: 'bottom top-=40%',
                scrub: true
            }
        });
    });
    fx24Titles.forEach((title)=>{
        const chars = title.querySelectorAll('.char');
        const charsTotal = chars.length;
        (0, _gsap.gsap).fromTo(chars, {
            'will-change': 'transform',
            y: (position)=>{
                const factor = position < Math.ceil(charsTotal / 2) ? position : Math.ceil(charsTotal / 2) - Math.abs(Math.floor(charsTotal / 2) - position) - 1;
                return (charsTotal / 2 - factor + 6) * 130;
            }
        }, {
            ease: 'elastic.out(.4)',
            y: 0,
            stagger: {
                amount: 0.1,
                from: 'center'
            },
            scrollTrigger: {
                trigger: title,
                start: 'top bottom',
                end: 'bottom top-=50%',
                scrub: true
            }
        });
    });
    fx25Titles.forEach((title)=>{
        (0, _gsap.gsap).fromTo(title.querySelectorAll('.char'), {
            'will-change': 'transform',
            transformOrigin: '50% 100%',
            scaleY: 0
        }, {
            ease: 'power3.in',
            opacity: 1,
            scaleY: 1,
            stagger: 0.05,
            scrollTrigger: {
                trigger: title,
                start: 'center center',
                end: '+=500%',
                scrub: true,
                pin: title.parentNode
            }
        });
    });
    fx26Titles.forEach((title)=>{
        const words = [
            ...title.querySelectorAll('.word')
        ];
        const tl = (0, _gsap.gsap).timeline({
            scrollTrigger: {
                trigger: title,
                start: 'center center',
                end: '+=100%',
                scrub: true,
                pin: title.parentNode
            }
        });
        for (const [wordPosition, word] of words.entries())tl.fromTo(word.querySelectorAll('.char'), {
            'will-change': 'transform',
            transformOrigin: ()=>!wordPosition % 2 ? '50% 0%' : '50% 100%',
            scaleY: 0
        }, {
            ease: 'power1.inOut',
            scaleY: 1,
            stagger: {
                amount: 0.3,
                from: 'center'
            }
        }, 0);
    });
    fx27Titles.forEach((title)=>{
        const words = [
            ...title.querySelectorAll('.word')
        ];
        words.forEach((word)=>(0, _gsap.gsap).set(word.parentNode, {
                perspective: 1000
            }));
        (0, _gsap.gsap).fromTo(words, {
            'will-change': 'opacity, transform',
            z: ()=>(0, _gsap.gsap).utils.random(500, 950),
            opacity: 0,
            xPercent: (pos)=>(0, _gsap.gsap).utils.random(-100, 100),
            yPercent: (pos)=>(0, _gsap.gsap).utils.random(-10, 10),
            rotationX: ()=>(0, _gsap.gsap).utils.random(-90, 90)
        }, {
            ease: 'expo',
            opacity: 1,
            rotationX: 0,
            rotationY: 0,
            xPercent: 0,
            yPercent: 0,
            z: 0,
            scrollTrigger: {
                trigger: title,
                start: 'center center',
                end: '+=300%',
                scrub: true,
                pin: title.parentNode
            },
            stagger: {
                each: 0.006,
                from: 'random'
            }
        });
    });
    fx28Titles.forEach((title)=>{
        const words = [
            ...title.querySelectorAll('.word')
        ];
        for (const word of words){
            const chars = word.querySelectorAll('.char');
            const charsTotal = chars.length;
            (0, _gsap.gsap).fromTo(chars, {
                'will-change': 'transform, filter',
                transformOrigin: '50% 100%',
                scale: (position)=>{
                    const factor = position < Math.ceil(charsTotal / 2) ? position : Math.ceil(charsTotal / 2) - Math.abs(Math.floor(charsTotal / 2) - position) - 1;
                    return (0, _gsap.gsap).utils.mapRange(0, Math.ceil(charsTotal / 2), 0.5, 2.1, factor);
                },
                y: (position)=>{
                    const factor = position < Math.ceil(charsTotal / 2) ? position : Math.ceil(charsTotal / 2) - Math.abs(Math.floor(charsTotal / 2) - position) - 1;
                    return (0, _gsap.gsap).utils.mapRange(0, Math.ceil(charsTotal / 2), 0, 60, factor);
                },
                rotation: (position)=>{
                    const factor = position < Math.ceil(charsTotal / 2) ? position : Math.ceil(charsTotal / 2) - Math.abs(Math.floor(charsTotal / 2) - position) - 1;
                    return position < charsTotal / 2 ? (0, _gsap.gsap).utils.mapRange(0, Math.ceil(charsTotal / 2), -4, 0, factor) : (0, _gsap.gsap).utils.mapRange(0, Math.ceil(charsTotal / 2), 0, 4, factor);
                },
                filter: 'blur(12px) opacity(0)'
            }, {
                ease: 'power2.inOut',
                y: 0,
                rotation: 0,
                scale: 1,
                filter: 'blur(0px) opacity(1)',
                scrollTrigger: {
                    trigger: word,
                    start: 'top bottom+=40%',
                    end: 'top top+=15%',
                    scrub: true
                },
                stagger: {
                    amount: 0.15,
                    from: 'center'
                }
            });
        }
    });
    fx29Titles.forEach((title)=>{
        const words = [
            ...title.querySelectorAll('.word')
        ];
        for (const [pos, word] of words.entries()){
            const chars = word.querySelectorAll('.char');
            (0, _gsap.gsap).fromTo(chars, {
                'will-change': 'transform',
                transformOrigin: `${pos % 2 ? 0 : 100}% ${pos % 2 ? 100 : 0}%`,
                scale: 0
            }, {
                ease: 'power4',
                scale: 1,
                stagger: {
                    each: 0.03,
                    from: pos % 2 ? 'end' : 'start'
                },
                scrollTrigger: {
                    trigger: word,
                    start: 'top bottom-=10%',
                    end: 'top top',
                    scrub: true
                }
            });
        }
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

},{"./utils":"bMpAD","@studio-freight/lenis":"1tY0F","gsap":"9F7Z6","gsap/ScrollTrigger":"372oo","splitting/dist/splitting.css":"3uR7n","splitting/dist/splitting-cells.css":"7jeGL","splitting":"6m3bh","@parcel/transformer-js/src/esmodule-helpers.js":"jnFvT"}],"3uR7n":[function() {},{}],"7jeGL":[function() {},{}]},["c54Ky","3RRCp"], "3RRCp", "parcelRequire2524", {})

//# sourceMappingURL=index2.e2ea822d.js.map
