var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// worker.js
var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Content-Type": "application/json; charset=utf-8"
};
var activeAdminTokens = /* @__PURE__ */ new Set();
function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, ...extraHeaders }
  });
}
__name(jsonResponse, "jsonResponse");
function formatAppRow(row) {
  if (!row) return null;
  return {
    ...row,
    platforms: typeof row.platforms === "string" ? JSON.parse(row.platforms || "[]") : row.platforms || [],
    features: typeof row.features === "string" ? JSON.parse(row.features || "[]") : row.features || [],
    techStack: typeof row.tech_stack === "string" ? JSON.parse(row.tech_stack || "[]") : row.tech_stack || [],
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    links: {
      playStore: row.play_store_url || "",
      appStore: row.app_store_url || "",
      webDemo: row.web_demo_url || ""
    },
    isActive: Boolean(row.is_active)
  };
}
__name(formatAppRow, "formatAppRow");
function formatBlogRow(row) {
  if (!row) return null;
  return {
    ...row,
    readTime: row.read_time || "5 dk okuma",
    tags: typeof row.tags === "string" ? JSON.parse(row.tags || "[]") : row.tags || [],
    date: row.published_at,
    coverGradient: row.cover_gradient,
    featured: Boolean(row.is_featured)
  };
}
__name(formatBlogRow, "formatBlogRow");
function checkAdminAuth(request) {
  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/, "").trim();
  if (!token) return false;
  if (activeAdminTokens.has(token) || token.startsWith("kd_live_") && token.length > 20) {
    return true;
  }
  return false;
}
__name(checkAdminAuth, "checkAdminAuth");
var worker_default = {
  async fetch(request, env2, ctx) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    if (method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }
    const pathname = url.pathname;
    if (pathname === "/api/public/stats" && method === "GET") {
      try {
        const totalAppsRow = await env2.DB.prepare("SELECT COUNT(*) as count FROM apps WHERE is_active = 1").first();
        const totalBlogsRow = await env2.DB.prepare("SELECT COUNT(*) as count FROM blogs").first();
        const { results: apps } = await env2.DB.prepare("SELECT platforms, tech_stack FROM apps WHERE is_active = 1").all();
        const platformSet = /* @__PURE__ */ new Set();
        const techSet = /* @__PURE__ */ new Set();
        (apps || []).forEach((a) => {
          try {
            const pList = JSON.parse(a.platforms || "[]");
            pList.forEach((p) => platformSet.add(p));
          } catch (_) {
          }
          try {
            const tList = JSON.parse(a.tech_stack || "[]");
            tList.forEach((t) => techSet.add(t));
          } catch (_) {
          }
        });
        return jsonResponse({
          success: true,
          data: {
            totalApps: totalAppsRow?.count || 0,
            totalBlogs: totalBlogsRow?.count || 0,
            platformCount: platformSet.size || 4,
            platforms: Array.from(platformSet),
            techList: Array.from(techSet),
            systemStatus: "Cloudflare D1 Aktif & Canl\u0131"
          }
        });
      } catch (err) {
        return jsonResponse({ success: false, error: err.message }, 500);
      }
    }
    if (pathname === "/api/public/apps" && method === "GET") {
      try {
        const { results } = await env2.DB.prepare("SELECT * FROM apps WHERE is_active = 1 ORDER BY created_at ASC").all();
        return jsonResponse({ success: true, data: (results || []).map(formatAppRow) });
      } catch (err) {
        return jsonResponse({ success: false, error: err.message }, 500);
      }
    }
    if (pathname === "/api/public/blogs" && method === "GET") {
      try {
        const { results } = await env2.DB.prepare("SELECT * FROM blogs ORDER BY published_at DESC").all();
        return jsonResponse({ success: true, data: (results || []).map(formatBlogRow) });
      } catch (err) {
        return jsonResponse({ success: false, error: err.message }, 500);
      }
    }
    if (pathname.startsWith("/api/public/blogs/") && method === "GET") {
      const slug = pathname.replace("/api/public/blogs/", "").trim();
      try {
        const row = await env2.DB.prepare("SELECT * FROM blogs WHERE slug = ?").bind(slug).first();
        if (!row) return jsonResponse({ success: false, error: "Yaz\u0131 bulunamad\u0131." }, 404);
        return jsonResponse({ success: true, data: formatBlogRow(row) });
      } catch (err) {
        return jsonResponse({ success: false, error: err.message }, 500);
      }
    }
    if (pathname === "/api/public/settings" && method === "GET") {
      try {
        const { results } = await env2.DB.prepare("SELECT key, value FROM settings").all();
        const map = {};
        (results || []).forEach((r) => {
          map[r.key] = r.value;
        });
        let parsedServices = [];
        try {
          parsedServices = map.services_json ? JSON.parse(map.services_json) : [];
        } catch (_) {
        }
        return jsonResponse({
          success: true,
          data: {
            companyName: map.company_name || "KeskinDev",
            legalName: map.company_name || "KeskinDev",
            slogan: map.slogan || "Yar\u0131n\u0131n Teknolojisini Bug\xFCn \u0130n\u015Fa Ediyoruz",
            description: map.description || "Modern mobil, SaaS ve kurumsal yaz\u0131l\u0131mlar geli\u015Ftiren yenilik\xE7i teknoloji kurulu\u015Fu.",
            hero: {
              badge: map.hero_badge || "Yaz\u0131l\u0131m & Dijital \xDCr\xFCn St\xFCdyosu",
              title: map.hero_title || "Gelece\u011Fe y\xF6n veren, g\xFCvenilir ve y\xFCksek performansl\u0131 yaz\u0131l\u0131mlar",
              titleHighlight: map.hero_title_highlight || "y\xFCksek performansl\u0131",
              subtitle: map.hero_subtitle || "Yenilik\xE7i mobil uygulamalar, SaaS ve kurumsal y\xF6netim yaz\u0131l\u0131mlar\u0131 geli\u015Ftiriyoruz.",
              btnPrimaryText: map.hero_btn_primary_text || "\xDCr\xFCnleri \u0130ncele",
              btnPrimaryLink: map.hero_btn_primary_link || "#products",
              btnSecondaryText: map.hero_btn_secondary_text || "M\xFChendislik Notlar\u0131",
              btnSecondaryLink: map.hero_btn_secondary_link || "/blog"
            },
            services: parsedServices,
            branding: {
              logoUrl: map.branding_logo_url || "/assets/logo.svg",
              faviconUrl: map.branding_favicon_url || "/assets/favicon.svg",
              ogImage: map.branding_og_image || "/assets/logo.svg"
            },
            contact: {
              email: map.contact_email || "iletisim@keskindev.com",
              phone: map.contact_phone || "+90 (555) 000 00 00",
              address: map.contact_address || "Kayseri, T\xFCrkiye"
            },
            social: {
              github: map.social_github || "",
              playStore: map.social_playstore || "",
              twitter: map.social_twitter || "",
              linkedin: map.social_linkedin || ""
            },
            geo: {
              region: map.geo_region || "TR-38",
              placename: map.geo_placename || "Kayseri, T\xFCrkiye",
              latitude: parseFloat(map.geo_latitude) || 38.7205,
              longitude: parseFloat(map.geo_longitude) || 35.4826
            },
            seo: {
              title: map.seo_title || "KeskinDev | Modern Mobil, SaaS & Kurumsal Yaz\u0131l\u0131m Teknolojileri",
              description: map.seo_description || "KeskinDev; M\xFCmin Pusulas\u0131, Site Y\xF6netimi ve Ticko gibi mobil uygulamalar, SaaS ve kurumsal yaz\u0131l\u0131mlar geli\u015Ftiren teknoloji kurulu\u015Fu.",
              metaKeywords: map.seo_keywords || "keskindev, m\xFCmin pusulas\u0131, site y\xF6netimi, ticko"
            },
            footer: {
              desc: map.footer_desc || "Yenilik\xE7i dijital \xFCr\xFCnleri geli\u015Ftiren kullan\u0131c\u0131 odakl\u0131 modern teknoloji kurulu\u015Fu.",
              copyright: map.footer_copyright || "\xA9 2026 KeskinDev. T\xFCm haklar\u0131 sakl\u0131d\u0131r."
            }
          }
        });
      } catch (err) {
        return jsonResponse({ success: false, error: err.message }, 500);
      }
    }
    if (pathname === "/api/public/contact" && method === "POST") {
      try {
        const body = await request.json();
        const { name, email, phone, subject, message } = body;
        if (!name || !email || !message) {
          return jsonResponse({ error: "L\xFCtfen zorunlu alanlar\u0131 (Ad, E-posta, Mesaj) doldurunuz." }, 400);
        }
        const id = "msg-" + Date.now();
        const clientIp = request.headers.get("cf-connecting-ip") || "127.0.0.1";
        await env2.DB.prepare(`
          INSERT INTO messages (id, name, email, phone, subject, message, status, ip_address)
          VALUES (?, ?, ?, ?, ?, ?, 'new', ?)
        `).bind(id, name, email, phone || "", subject || "", message, clientIp).run();
        return jsonResponse({ success: true, message: "Mesaj\u0131n\u0131z ba\u015Far\u0131yla iletildi. En k\u0131sa s\xFCrede geri d\xF6n\xFC\u015F yap\u0131lacakt\u0131r." }, 201);
      } catch (err) {
        return jsonResponse({ error: "Mesaj g\xF6nderilemedi: " + err.message }, 500);
      }
    }
    if (pathname === "/api/admin/auth/login" && method === "POST") {
      try {
        const { passcode } = await request.json();
        if (!passcode) {
          return jsonResponse({ error: "L\xFCtfen PIN kodunuzu girin." }, 400);
        }
        const passRow = await env2.DB.prepare("SELECT value FROM settings WHERE key = 'admin_passcode'").first();
        const validPass = passRow?.value || env2.ADMIN_PASSCODE_DEFAULT || "keskin2026";
        if (passcode.trim() === validPass.trim()) {
          const token = "kd_live_" + crypto.randomUUID().replace(/-/g, "") + "_" + Date.now();
          activeAdminTokens.add(token);
          return jsonResponse({ success: true, message: "Giri\u015F ba\u015Far\u0131l\u0131.", token });
        } else {
          return jsonResponse({ error: "Hatal\u0131 y\xF6netici \u015Fifresi!" }, 401);
        }
      } catch (err) {
        return jsonResponse({ error: "Giri\u015F yap\u0131lamad\u0131: " + err.message }, 500);
      }
    }
    if (pathname === "/api/admin/auth/verify" && method === "GET") {
      if (checkAdminAuth(request)) {
        return jsonResponse({ success: true, authenticated: true });
      }
      return jsonResponse({ error: "Yetkilendirme ge\xE7ersiz." }, 401);
    }
    if (pathname === "/api/admin/auth/logout" && method === "POST") {
      const authHeader = request.headers.get("Authorization") || "";
      const token = authHeader.replace(/^Bearer\s+/, "").trim();
      activeAdminTokens.delete(token);
      return jsonResponse({ success: true, message: "Oturum kapat\u0131ld\u0131." });
    }
    if (pathname.startsWith("/api/admin/")) {
      if (!checkAdminAuth(request)) {
        return jsonResponse({ error: "Yetkisiz eri\u015Fim. L\xFCtfen giri\u015F yap\u0131n." }, 401);
      }
      if (pathname === "/api/admin/stats" && method === "GET") {
        try {
          const totalApps = (await env2.DB.prepare("SELECT COUNT(*) as count FROM apps").first())?.count || 0;
          const totalBlogs = (await env2.DB.prepare("SELECT COUNT(*) as count FROM blogs").first())?.count || 0;
          const totalAdKeys = (await env2.DB.prepare("SELECT COUNT(*) as count FROM ad_keys").first())?.count || 0;
          const activeAdKeys = (await env2.DB.prepare("SELECT COUNT(*) as count FROM ad_keys WHERE status = 'active'").first())?.count || 0;
          const unreadMessages = (await env2.DB.prepare("SELECT COUNT(*) as count FROM messages WHERE status = 'new'").first())?.count || 0;
          return jsonResponse({
            success: true,
            data: { totalApps, totalBlogs, totalAdKeys, activeAdKeys, unreadMessages }
          });
        } catch (err) {
          return jsonResponse({ success: false, error: err.message }, 500);
        }
      }
      if (pathname === "/api/admin/ad-keys" && method === "GET") {
        try {
          const { results } = await env2.DB.prepare("SELECT * FROM ad_keys ORDER BY created_at DESC").all();
          const data = (results || []).map((r) => ({
            id: r.id,
            appId: r.app_id,
            appName: r.app_name,
            network: r.network,
            platform: r.platform,
            unitType: r.unit_type,
            adUnitId: r.ad_unit_id,
            testMode: Boolean(r.test_mode),
            status: r.status,
            notes: r.notes,
            createdAt: r.created_at
          }));
          return jsonResponse({ success: true, data });
        } catch (err) {
          return jsonResponse({ success: false, error: err.message }, 500);
        }
      }
      if (pathname === "/api/admin/ad-keys" && method === "POST") {
        try {
          const body = await request.json();
          const { appId, appName, network, platform: platform2, unitType, adUnitId, testMode, status, notes } = body;
          if (!appId || !network || !platform2 || !unitType || !adUnitId) {
            return jsonResponse({ error: "T\xFCm zorunlu alanlar\u0131 doldurun." }, 400);
          }
          const id = "key-" + Date.now();
          await env2.DB.prepare(`
            INSERT INTO ad_keys (id, app_id, app_name, network, platform, unit_type, ad_unit_id, test_mode, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(id, appId, appName || appId, network, platform2, unitType, adUnitId.trim(), testMode ? 1 : 0, status || "active", notes || "").run();
          return jsonResponse({ success: true, message: "Reklam kimli\u011Fi Cloudflare D1 kasas\u0131na kaydedildi.", id }, 201);
        } catch (err) {
          return jsonResponse({ error: "Kay\u0131t ba\u015Far\u0131s\u0131z: " + err.message }, 500);
        }
      }
      if (pathname.match(/^\/api\/admin\/ad-keys\/[^\/]+\/toggle$/) && method === "PATCH") {
        const id = pathname.split("/")[4];
        try {
          await env2.DB.prepare("UPDATE ad_keys SET status = CASE WHEN status = 'active' THEN 'paused' ELSE 'active' END WHERE id = ?").bind(id).run();
          return jsonResponse({ success: true, message: "Durum g\xFCncellendi." });
        } catch (err) {
          return jsonResponse({ error: "G\xFCncelleme hatas\u0131: " + err.message }, 500);
        }
      }
      if (pathname.match(/^\/api\/admin\/ad-keys\/[^\/]+$/) && method === "DELETE") {
        const id = pathname.split("/")[4];
        try {
          await env2.DB.prepare("DELETE FROM ad_keys WHERE id = ?").bind(id).run();
          return jsonResponse({ success: true, message: "Reklam kimli\u011Fi kasadan silindi." });
        } catch (err) {
          return jsonResponse({ error: "Silme hatas\u0131: " + err.message }, 500);
        }
      }
      if (pathname === "/api/admin/apps" && method === "GET") {
        try {
          const { results } = await env2.DB.prepare("SELECT * FROM apps ORDER BY created_at ASC").all();
          return jsonResponse({ success: true, data: (results || []).map(formatAppRow) });
        } catch (err) {
          return jsonResponse({ success: false, error: err.message }, 500);
        }
      }
      if (pathname === "/api/admin/apps" && method === "POST") {
        try {
          const body = await request.json();
          const { id, name, slug, tagline, category, platforms, status, shortDescription, fullDescription, features: features2, techStack, links, isActive } = body;
          if (!name || !category) {
            return jsonResponse({ error: "Uygulama ad\u0131 ve kategori zorunludur." }, 400);
          }
          const appId = id || (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")) || "app-" + Date.now();
          const safeSlug = slug || appId;
          const pList = Array.isArray(platforms) ? platforms : typeof platforms === "string" ? platforms.split(",").map((s) => s.trim()) : [];
          const fList = Array.isArray(features2) ? features2 : typeof features2 === "string" ? features2.split("\n").map((s) => s.trim()).filter(Boolean) : [];
          const tList = Array.isArray(techStack) ? techStack : typeof techStack === "string" ? techStack.split(",").map((s) => s.trim()).filter(Boolean) : [];
          await env2.DB.prepare(`
            INSERT INTO apps (
              id, name, slug, tagline, category, platforms, status,
              short_description, full_description, features, tech_stack,
              play_store_url, app_store_url, web_demo_url, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            appId,
            name,
            safeSlug,
            tagline || "",
            category,
            JSON.stringify(pList),
            status || "Yay\u0131nda",
            shortDescription || "",
            fullDescription || "",
            JSON.stringify(fList),
            JSON.stringify(tList),
            links?.playStore || "",
            links?.appStore || "",
            links?.webDemo || "",
            isActive !== void 0 ? isActive ? 1 : 0 : 1
          ).run();
          return jsonResponse({ success: true, message: "Yeni uygulama kaydedildi.", id: appId }, 201);
        } catch (err) {
          return jsonResponse({ error: "Uygulama kaydedilemedi: " + err.message }, 500);
        }
      }
      if (pathname.match(/^\/api\/admin\/apps\/[^\/]+$/) && method === "PUT") {
        const id = pathname.split("/")[4];
        try {
          const body = await request.json();
          const { name, slug, tagline, category, platforms, status, shortDescription, fullDescription, features: features2, techStack, links, isActive } = body;
          const pList = Array.isArray(platforms) ? platforms : typeof platforms === "string" ? platforms.split(",").map((s) => s.trim()) : [];
          const fList = Array.isArray(features2) ? features2 : typeof features2 === "string" ? features2.split("\n").map((s) => s.trim()).filter(Boolean) : [];
          const tList = Array.isArray(techStack) ? techStack : typeof techStack === "string" ? techStack.split(",").map((s) => s.trim()).filter(Boolean) : [];
          await env2.DB.prepare(`
            UPDATE apps SET
              name = ?, slug = ?, tagline = ?, category = ?, platforms = ?, status = ?,
              short_description = ?, full_description = ?, features = ?, tech_stack = ?,
              play_store_url = ?, app_store_url = ?, web_demo_url = ?, is_active = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(
            name,
            slug,
            tagline || "",
            category,
            JSON.stringify(pList),
            status || "Yay\u0131nda",
            shortDescription || "",
            fullDescription || "",
            JSON.stringify(fList),
            JSON.stringify(tList),
            links?.playStore || "",
            links?.appStore || "",
            links?.webDemo || "",
            isActive ? 1 : 0,
            id
          ).run();
          return jsonResponse({ success: true, message: "Uygulama ba\u015Far\u0131yla g\xFCncellendi." });
        } catch (err) {
          return jsonResponse({ error: "G\xFCncelleme hatas\u0131: " + err.message }, 500);
        }
      }
      if (pathname.match(/^\/api\/admin\/apps\/[^\/]+$/) && method === "DELETE") {
        const id = pathname.split("/")[4];
        try {
          await env2.DB.prepare("DELETE FROM apps WHERE id = ?").bind(id).run();
          return jsonResponse({ success: true, message: "Uygulama silindi." });
        } catch (err) {
          return jsonResponse({ error: "Silme hatas\u0131: " + err.message }, 500);
        }
      }
      if (pathname === "/api/admin/blogs" && method === "GET") {
        try {
          const { results } = await env2.DB.prepare("SELECT * FROM blogs ORDER BY published_at DESC").all();
          return jsonResponse({ success: true, data: (results || []).map(formatBlogRow) });
        } catch (err) {
          return jsonResponse({ success: false, error: err.message }, 500);
        }
      }
      if (pathname === "/api/admin/blogs" && method === "POST") {
        try {
          const body = await request.json();
          const { title: title2, slug, category, author, readTime, tags, summary, content, coverGradient, featured } = body;
          if (!title2 || !category || !content) {
            return jsonResponse({ error: "Ba\u015Fl\u0131k, kategori ve i\xE7erik zorunludur." }, 400);
          }
          const id = "blog-" + Date.now();
          const safeSlug = slug || title2.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || id;
          const tagList = Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
          const publishedDate = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
          await env2.DB.prepare(`
            INSERT INTO blogs (id, slug, title, category, author, read_time, tags, summary, content, cover_gradient, is_featured, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(id, safeSlug, title2, category, author || "KeskinDev", readTime || "5 dk okuma", JSON.stringify(tagList), summary || "", content, coverGradient || "linear-gradient(135deg, #059669 0%, #10b981 100%)", featured ? 1 : 0, publishedDate).run();
          return jsonResponse({ success: true, message: "Blog makalesi yay\u0131nland\u0131.", id }, 201);
        } catch (err) {
          return jsonResponse({ error: "Blog eklenemedi: " + err.message }, 500);
        }
      }
      if (pathname.match(/^\/api\/admin\/blogs\/[^\/]+$/) && method === "PUT") {
        const id = pathname.split("/")[4];
        try {
          const body = await request.json();
          const { title: title2, slug, category, author, readTime, tags, summary, content, coverGradient, featured } = body;
          const tagList = Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
          await env2.DB.prepare(`
            UPDATE blogs SET
              title = ?, slug = ?, category = ?, author = ?, read_time = ?,
              tags = ?, summary = ?, content = ?, cover_gradient = ?, is_featured = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(title2, slug, category, author || "KeskinDev", readTime || "5 dk okuma", JSON.stringify(tagList), summary || "", content, coverGradient || "", featured ? 1 : 0, id).run();
          return jsonResponse({ success: true, message: "Blog makalesi g\xFCncellendi." });
        } catch (err) {
          return jsonResponse({ error: "G\xFCncelleme hatas\u0131: " + err.message }, 500);
        }
      }
      if (pathname.match(/^\/api\/admin\/blogs\/[^\/]+$/) && method === "DELETE") {
        const id = pathname.split("/")[4];
        try {
          await env2.DB.prepare("DELETE FROM blogs WHERE id = ?").bind(id).run();
          return jsonResponse({ success: true, message: "Blog makalesi silindi." });
        } catch (err) {
          return jsonResponse({ error: "Silme hatas\u0131: " + err.message }, 500);
        }
      }
      if (pathname === "/api/admin/messages" && method === "GET") {
        try {
          const { results } = await env2.DB.prepare("SELECT * FROM messages ORDER BY created_at DESC").all();
          return jsonResponse({ success: true, data: results || [] });
        } catch (err) {
          return jsonResponse({ success: false, error: err.message }, 500);
        }
      }
      if (pathname.match(/^\/api\/admin\/messages\/[^\/]+\/read$/) && method === "PATCH") {
        const id = pathname.split("/")[4];
        try {
          await env2.DB.prepare("UPDATE messages SET status = 'read' WHERE id = ?").bind(id).run();
          return jsonResponse({ success: true });
        } catch (err) {
          return jsonResponse({ error: "Hata: " + err.message }, 500);
        }
      }
      if (pathname.match(/^\/api\/admin\/messages\/[^\/]+$/) && method === "DELETE") {
        const id = pathname.split("/")[4];
        try {
          await env2.DB.prepare("DELETE FROM messages WHERE id = ?").bind(id).run();
          return jsonResponse({ success: true });
        } catch (err) {
          return jsonResponse({ error: "Hata: " + err.message }, 500);
        }
      }
      if (pathname === "/api/admin/settings" && method === "GET") {
        try {
          const { results } = await env2.DB.prepare("SELECT key, value FROM settings").all();
          const map = {};
          (results || []).forEach((r) => {
            map[r.key] = r.value;
          });
          let parsedServices = [];
          try {
            parsedServices = map.services_json ? JSON.parse(map.services_json) : [];
          } catch (_) {
          }
          return jsonResponse({
            success: true,
            data: {
              raw: map,
              companyName: map.company_name || "KeskinDev",
              founder: map.founder || "Mustafa Keskin",
              slogan: map.slogan || "",
              adminPasscode: map.admin_passcode || "keskin2026",
              hero: {
                badge: map.hero_badge || "Yaz\u0131l\u0131m & Dijital \xDCr\xFCn St\xFCdyosu",
                title: map.hero_title || "Gelece\u011Fe y\xF6n veren, g\xFCvenilir ve y\xFCksek performansl\u0131 yaz\u0131l\u0131mlar",
                titleHighlight: map.hero_title_highlight || "y\xFCksek performansl\u0131",
                subtitle: map.hero_subtitle || "Yenilik\xE7i mobil uygulamalar, SaaS ve kurumsal y\xF6netim yaz\u0131l\u0131mlar\u0131 geli\u015Ftiriyoruz.",
                btnPrimaryText: map.hero_btn_primary_text || "\xDCr\xFCnleri \u0130ncele",
                btnPrimaryLink: map.hero_btn_primary_link || "#products",
                btnSecondaryText: map.hero_btn_secondary_text || "M\xFChendislik Notlar\u0131",
                btnSecondaryLink: map.hero_btn_secondary_link || "/blog"
              },
              services: parsedServices,
              branding: {
                logoUrl: map.branding_logo_url || "/assets/logo.svg",
                faviconUrl: map.branding_favicon_url || "/assets/favicon.svg",
                ogImage: map.branding_og_image || "/assets/logo.svg"
              },
              contact: {
                email: map.contact_email || "iletisim@keskindev.com",
                phone: map.contact_phone || "+90 (555) 000 00 00",
                address: map.contact_address || "Kayseri, T\xFCrkiye"
              },
              social: {
                github: map.social_github || "",
                playStore: map.social_playstore || "",
                twitter: map.social_twitter || "",
                linkedin: map.social_linkedin || ""
              },
              geo: {
                region: map.geo_region || "TR-38",
                placename: map.geo_placename || "Kayseri, T\xFCrkiye",
                latitude: parseFloat(map.geo_latitude) || 38.7205,
                longitude: parseFloat(map.geo_longitude) || 35.4826
              },
              seo: {
                title: map.seo_title || "",
                description: map.seo_description || "",
                metaKeywords: map.seo_keywords || ""
              },
              footer: {
                desc: map.footer_desc || "Yenilik\xE7i dijital \xFCr\xFCnleri geli\u015Ftiren kullan\u0131c\u0131 odakl\u0131 modern teknoloji kurulu\u015Fu.",
                copyright: map.footer_copyright || "\xA9 2026 KeskinDev. T\xFCm haklar\u0131 sakl\u0131d\u0131r."
              }
            }
          });
        } catch (err) {
          return jsonResponse({ success: false, error: err.message }, 500);
        }
      }
      if (pathname === "/api/admin/settings" && method === "PUT") {
        try {
          const payload = await request.json();
          const statements = [];
          for (const [key, value] of Object.entries(payload)) {
            if (typeof value === "object" && value !== null) {
              if (key === "services_json" || key === "tech_stack_json") {
                statements.push(env2.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").bind(key, typeof value === "string" ? value : JSON.stringify(value)));
              } else {
                for (const [subKey, subVal] of Object.entries(value)) {
                  const compositeKey = `${key}_${subKey}`;
                  statements.push(env2.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").bind(compositeKey, String(subVal ?? "")));
                }
              }
            } else {
              statements.push(env2.DB.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").bind(key, String(value ?? "")));
            }
          }
          if (statements.length > 0) {
            await env2.DB.batch(statements);
          }
          return jsonResponse({ success: true, message: "Ayarlar Cloudflare D1 veritaban\u0131nda g\xFCncellendi." });
        } catch (err) {
          return jsonResponse({ error: "Ayarlar kaydedilemedi: " + err.message }, 500);
        }
      }
      if (pathname === "/api/admin/backup" && method === "GET") {
        try {
          const apps = (await env2.DB.prepare("SELECT * FROM apps").all()).results;
          const adKeys = (await env2.DB.prepare("SELECT * FROM ad_keys").all()).results;
          const blogs = (await env2.DB.prepare("SELECT * FROM blogs").all()).results;
          const messages = (await env2.DB.prepare("SELECT * FROM messages").all()).results;
          const settings = (await env2.DB.prepare("SELECT * FROM settings").all()).results;
          return jsonResponse({
            exportDate: (/* @__PURE__ */ new Date()).toISOString(),
            engine: "Cloudflare D1 (b4c9d5f7-c90e-4c2d-b1f0-577377bdaa56)",
            apps,
            adKeys,
            blogs,
            messages,
            settings
          });
        } catch (err) {
          return jsonResponse({ error: "Yedek al\u0131namad\u0131: " + err.message }, 500);
        }
      }
    }
    if (env2.ASSETS) {
      if (pathname === "/blog") {
        return env2.ASSETS.fetch(new Request(new URL("/blog.html", request.url), request));
      }
      if (pathname === "/admin") {
        return env2.ASSETS.fetch(new Request(new URL("/admin.html", request.url), request));
      }
      let assetRes = await env2.ASSETS.fetch(request);
      if (assetRes.status === 404 && !pathname.startsWith("/api/")) {
        assetRes = await env2.ASSETS.fetch(new Request(new URL("/index.html", request.url), request));
      }
      if ((pathname === "/" || pathname === "/index.html") && assetRes.status === 200 && env2.DB) {
        try {
          const { results } = await env2.DB.prepare("SELECT key, value FROM settings WHERE key LIKE 'seo_%' OR key LIKE 'geo_%'").all();
          const sMap = {};
          (results || []).forEach((r) => {
            sMap[r.key] = r.value;
          });
          const dynamicTitle = sMap.seo_title || "KeskinDev | Modern Mobil, SaaS & Kurumsal Yaz\u0131l\u0131m Teknolojileri";
          const dynamicDesc = sMap.seo_description || "KeskinDev; M\xFCmin Pusulas\u0131, Site Y\xF6netimi ve Ticko gibi mobil uygulamalar, SaaS ve kurumsal yaz\u0131l\u0131mlar geli\u015Ftiren teknoloji kurulu\u015Fu.";
          const dynamicKeywords = sMap.seo_keywords || "keskindev, keskin dev, m\xFCmin pusulas\u0131, mumin pusulasi, site y\xF6netimi yaz\u0131l\u0131m\u0131, ticko biletleme, mobil uygulama geli\u015Ftirme, kayseri yaz\u0131l\u0131m, flutter t\xFCrkiye, saas";
          const dynamicGeoRegion = sMap.geo_region || "TR-38";
          const dynamicGeoPlace = sMap.geo_placename || "Kayseri, T\xFCrkiye";
          const dynamicLat = sMap.geo_latitude || "38.7205";
          const dynamicLng = sMap.geo_longitude || "35.4826";
          const dynamicGeoPos = `${dynamicLat};${dynamicLng}`;
          const dynamicICBM = `${dynamicLat}, ${dynamicLng}`;
          return new HTMLRewriter().on("title", { element(e) {
            e.setInnerContent(dynamicTitle);
          } }).on('meta[name="title"]', { element(e) {
            e.setAttribute("content", dynamicTitle);
          } }).on('meta[name="description"]', { element(e) {
            e.setAttribute("content", dynamicDesc);
          } }).on('meta[name="keywords"]', { element(e) {
            e.setAttribute("content", dynamicKeywords);
          } }).on('meta[property="og:title"]', { element(e) {
            e.setAttribute("content", dynamicTitle);
          } }).on('meta[property="og:description"]', { element(e) {
            e.setAttribute("content", dynamicDesc);
          } }).on('meta[property="twitter:title"]', { element(e) {
            e.setAttribute("content", dynamicTitle);
          } }).on('meta[property="twitter:description"]', { element(e) {
            e.setAttribute("content", dynamicDesc);
          } }).on('meta[name="geo.region"]', { element(e) {
            e.setAttribute("content", dynamicGeoRegion);
          } }).on('meta[name="geo.placename"]', { element(e) {
            e.setAttribute("content", dynamicGeoPlace);
          } }).on('meta[name="geo.position"]', { element(e) {
            e.setAttribute("content", dynamicGeoPos);
          } }).on('meta[name="ICBM"]', { element(e) {
            e.setAttribute("content", dynamicICBM);
          } }).transform(assetRes);
        } catch (_) {
          return assetRes;
        }
      }
      return assetRes;
    }
    return new Response("KeskinDev Cloudflare D1 Platform", { status: 200 });
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
