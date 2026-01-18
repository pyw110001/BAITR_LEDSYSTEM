var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/constants.js"(exports2, module2) {
    "use strict";
    var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
    var hasBlob = typeof Blob !== "undefined";
    if (hasBlob) BINARY_TYPES.push("blob");
    module2.exports = {
      BINARY_TYPES,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob,
      kForOnEventAttribute: /* @__PURE__ */ Symbol("kIsForOnEventAttribute"),
      kListener: /* @__PURE__ */ Symbol("kListener"),
      kStatusCode: /* @__PURE__ */ Symbol("status-code"),
      kWebSocket: /* @__PURE__ */ Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/buffer-util.js"(exports2, module2) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength) {
      if (list.length === 0) return EMPTY_BUFFER;
      if (list.length === 1) return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data)) return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module2.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = require("bufferutil");
        module2.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48) _mask(source, mask, output, offset, length);
          else bufferUtil.mask(source, mask, output, offset, length);
        };
        module2.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32) _unmask(buffer, mask);
          else bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/limiter.js"(exports2, module2) {
    "use strict";
    var kDone = /* @__PURE__ */ Symbol("kDone");
    var kRun = /* @__PURE__ */ Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency) return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module2.exports = Limiter;
  }
});

// node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/permessage-deflate.js"(exports2, module2) {
    "use strict";
    var zlib = require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = /* @__PURE__ */ Symbol("permessage-deflate");
    var kTotalLength = /* @__PURE__ */ Symbol("total-length");
    var kCallback = /* @__PURE__ */ Symbol("callback");
    var kBuffers = /* @__PURE__ */ Symbol("buffers");
    var kError = /* @__PURE__ */ Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       * @param {Boolean} [isServer=false] Create the instance in either server or
       *     client mode
       * @param {Number} [maxPayload=0] The maximum allowed message length
       */
      constructor(options, isServer, maxPayload) {
        this._maxPayload = maxPayload | 0;
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._isServer = !!isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin) this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module2.exports = PerMessageDeflate;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      if (this[kError]) {
        this[kCallback](this[kError]);
        return;
      }
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/validation.js"(exports2, module2) {
    "use strict";
    var { isUtf8 } = require("buffer");
    var { hasBlob } = require_constants();
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value) {
      return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
    }
    module2.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module2.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = require("utf-8-validate");
        module2.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/receiver.js"(exports2, module2) {
    "use strict";
    var { Writable } = require("stream");
    var PerMessageDeflate = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO) return cb();
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length) return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n,
              buf.length - n
            );
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored) cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
          const error = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (!this._fragmented) {
            const error = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error);
            return;
          }
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error);
            return;
          }
        } else {
          const error = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error);
          return;
        }
        if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error);
            return;
          }
        } else if (this._masked) {
          const error = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error);
          return;
        }
        if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
        else this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error);
            return;
          }
        }
        if (this._masked) this._state = GET_MASK;
        else this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err) return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO) this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else if (this._binaryType === "blob") {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              const error = this.createError(
                RangeError,
                `invalid status code ${code}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error);
              return;
            }
            this._loop = false;
            this.emit("conclude", code, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module2.exports = Receiver2;
  }
});

// node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/sender.js"(exports2, module2) {
    "use strict";
    var { Duplex } = require("stream");
    var { randomFillSync } = require("crypto");
    var PerMessageDeflate = require_permessage_deflate();
    var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
    var { isBlob, isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = /* @__PURE__ */ Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var RANDOM_POOL_SIZE = 8 * 1024;
    var randomPool;
    var randomPoolPointer = RANDOM_POOL_SIZE;
    var DEFAULT = 0;
    var DEFLATING = 1;
    var GET_BLOB_DATA = 2;
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = void 0;
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === void 0) {
                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1) target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask) return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking) return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else {
            buf.set(data, 2);
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin) this._firstFragment = true;
        const opts = {
          [kByteLength]: byteLength,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
          } else {
            this.getBlobData(data, this._compress, opts, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, this._compress, opts, cb]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      }
      /**
       * Gets the contents of a blob as binary data.
       *
       * @param {Blob} blob The blob
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     the data
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      getBlobData(blob, compress, options, cb) {
        this._bufferedBytes += options[kByteLength];
        this._state = GET_BLOB_DATA;
        blob.arrayBuffer().then((arrayBuffer) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while the blob was being read"
            );
            process.nextTick(callCallbacks, this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          const data = toBuffer(arrayBuffer);
          if (!compress) {
            this._state = DEFAULT;
            this.sendFrame(_Sender.frame(data, options), cb);
            this.dequeue();
          } else {
            this.dispatch(data, compress, options, cb);
          }
        }).catch((err) => {
          process.nextTick(onError, this, err, cb);
        });
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._state = DEFLATING;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while data was being compressed"
            );
            callCallbacks(this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._state = DEFAULT;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (this._state === DEFAULT && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {(Buffer | String)[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module2.exports = Sender2;
    function callCallbacks(sender, err, cb) {
      if (typeof cb === "function") cb(err);
      for (let i = 0; i < sender._queue.length; i++) {
        const params = sender._queue[i];
        const callback = params[params.length - 1];
        if (typeof callback === "function") callback(err);
      }
    }
    function onError(sender, err, cb) {
      callCallbacks(sender, err, cb);
      sender.onerror(err);
    }
  }
});

// node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/event-target.js"(exports2, module2) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = /* @__PURE__ */ Symbol("kCode");
    var kData = /* @__PURE__ */ Symbol("kData");
    var kError = /* @__PURE__ */ Symbol("kError");
    var kMessage = /* @__PURE__ */ Symbol("kMessage");
    var kReason = /* @__PURE__ */ Symbol("kReason");
    var kTarget = /* @__PURE__ */ Symbol("kTarget");
    var kType = /* @__PURE__ */ Symbol("kType");
    var kWasClean = /* @__PURE__ */ Symbol("kWasClean");
    var Event = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler, options = {}) {
        for (const listener of this.listeners(type)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module2.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/extension.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0) dest[name] = [elem];
      else dest[name].push(elem);
    }
    function parse(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1) start = i;
            else if (!mustUnescape) mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1) start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1) end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension) => {
        let configurations = extensions[extension];
        if (!Array.isArray(configurations)) configurations = [configurations];
        return configurations.map((params) => {
          return [extension].concat(
            Object.keys(params).map((k) => {
              let values = params[k];
              if (!Array.isArray(values)) values = [values];
              return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module2.exports = { format, parse };
  }
});

// node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/websocket.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events");
    var https = require("https");
    var http2 = require("http");
    var net2 = require("net");
    var tls = require("tls");
    var { randomBytes, createHash } = require("crypto");
    var { Duplex, Readable } = require("stream");
    var { URL } = require("url");
    var PerMessageDeflate = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var { isBlob } = require_validation();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse } = require_extension();
    var { toBuffer } = require_buffer_util();
    var closeTimeout = 30 * 1e3;
    var kAborted = /* @__PURE__ */ Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class _WebSocket extends EventEmitter {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._isServer = true;
        }
      }
      /**
       * For historical reasons, the custom "nodebuffer" type is used by the default
       * instead of "blob".
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type)) return;
        this._binaryType = type;
        if (this._receiver) this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket) return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        const sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;
        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        sender.onerror = senderOnError;
        if (socket.setTimeout) socket.setTimeout(0);
        if (socket.setNoDelay) socket.setNoDelay();
        if (head.length > 0) socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate.extensionName]) {
          this._extensions[PerMessageDeflate.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code, data) {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = _WebSocket.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err) return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        setCloseTimer(this);
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain) this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket2, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket2.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function") return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener;
    WebSocket2.prototype.removeEventListener = removeEventListener;
    module2.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: true,
        autoPong: true,
        protocolVersion: protocolVersions[1],
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL(address);
        } catch (e) {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes(16).toString("base64");
      const request = isSecure ? https.request : http2.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate(
          opts.perMessageDeflate !== true ? opts.perMessageDeflate : {},
          false,
          opts.maxPayload
        );
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost) delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted]) return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING) return;
        req = websocket._req = null;
        const upgrade = res.headers.upgrade;
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt) websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket2.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net2.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net2.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket2.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer(data).length;
        if (websocket._socket) websocket._sender._bufferedBytes += length;
        else websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0) return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005) websocket.close();
      else websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused) websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function senderOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket.readyState === WebSocket2.CLOSED) return;
      if (websocket.readyState === WebSocket2.OPEN) {
        websocket._readyState = WebSocket2.CLOSING;
        setCloseTimer(websocket);
      }
      this._socket.end();
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(
        websocket._socket.destroy.bind(websocket._socket),
        closeTimeout
      );
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      let chunk;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && (chunk = websocket._socket.read()) !== null) {
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket2.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket2.CLOSING;
        this.destroy();
      }
    }
  }
});

// node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/stream.js"(exports2, module2) {
    "use strict";
    var WebSocket2 = require_websocket();
    var { Duplex } = require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data)) ws.pause();
      });
      ws.once("error", function error(err) {
        if (duplex.destroyed) return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed) return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called) callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy) ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null) return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted) duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused) ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module2.exports = createWebSocketStream2;
  }
});

// node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/subprotocol.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1) end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module2.exports = { parse };
  }
});

// node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "node_modules/.pnpm/ws@8.18.3/node_modules/ws/lib/websocket-server.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events");
    var http2 = require("http");
    var { Duplex } = require("stream");
    var { createHash } = require("crypto");
    var extension = require_extension();
    var PerMessageDeflate = require_permessage_deflate();
    var subprotocol = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: true,
          autoPong: true,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http2.createServer((req, res) => {
            const body = http2.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true) options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server) return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb) this.once("close", cb);
        if (this._state === CLOSING) return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path) return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const upgrade = req.headers.upgrade;
        const version = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (key === void 0 || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version !== 13 && version !== 8) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
            "Sec-WebSocket-Version": "13, 8"
          });
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate(
            this.options.perMessageDeflate,
            true,
            this.options.maxPayload
          );
          try {
            const offers = extension.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
              extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(
                extensions,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable) return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING) return abortHandshake(socket, 503);
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate.extensionName]) {
          const params = extensions[PerMessageDeflate.extensionName].params;
          const value = extension.format({
            [PerMessageDeflate.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module2.exports = WebSocketServer2;
    function addListeners(server, map) {
      for (const event of Object.keys(map)) server.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server) {
      server._state = CLOSED;
      server.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      message = message || http2.STATUS_CODES[code];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code} ${http2.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server, req, socket, code, message, headers) {
      if (server.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message, headers);
      }
    }
  }
});

// node_modules/.pnpm/binpack@0.1.0/node_modules/binpack/index.js
var require_binpack = __commonJS({
  "node_modules/.pnpm/binpack@0.1.0/node_modules/binpack/index.js"(exports2, module2) {
    var sizeOfType = function(t) {
      if (t[0] === "U") {
        t = t.slice(1);
      }
      return {
        "Float32": 4,
        "Float64": 8,
        "Int8": 1,
        "Int16": 2,
        "Int32": 4,
        "Int64": 8
      }[t];
    };
    var endianConv = function(e, t) {
      if (t[t.length - 1] === "8")
        return "";
      if (e === "big") {
        return "BE";
      }
      return "LE";
    };
    var addBindings = function(binpackTypename, nodeTypename) {
      if (!(typeof nodeTypename !== "undefined" && nodeTypename !== null)) {
        nodeTypename = binpackTypename;
      }
      module2.exports["pack" + binpackTypename] = function(num, endian) {
        b = new Buffer(sizeOfType(binpackTypename));
        b["write" + nodeTypename + endianConv(endian, binpackTypename)](num, 0, true);
        return b;
      };
      module2.exports["unpack" + binpackTypename] = function(buff, endian) {
        return buff["read" + nodeTypename + endianConv(endian, binpackTypename)](0);
      };
    };
    var addIntBindings = function(n) {
      addBindings("Int" + n);
      addBindings("UInt" + n);
    };
    addIntBindings(8);
    addIntBindings(16);
    addIntBindings(32);
    twoToThe32 = Math.pow(2, 32);
    var read64 = function(unsigned) {
      return function(buff, endian) {
        var e = endianConv(endian, "");
        var u = unsigned ? "U" : "";
        var low, high;
        if (e === "LE") {
          low = buff.readUInt32LE(0);
          high = buff["read" + u + "Int32LE"](4);
        } else {
          low = buff.readUInt32BE(4);
          high = buff["read" + u + "Int32BE"](0);
        }
        return high * twoToThe32 + low;
      };
    };
    var write64 = function(unsigned) {
      return function(num, endian) {
        var e = endianConv(endian, "");
        var u = unsigned ? "U" : "";
        var b2 = new Buffer(8);
        var high = Math.floor(num / twoToThe32);
        var low = Math.floor(num - high * twoToThe32);
        if (e == "LE") {
          b2.writeUInt32LE(low, 0, true);
          b2["write" + u + "Int32LE"](high, 4, true);
        } else {
          b2.writeUInt32BE(low, 4, true);
          b2["write" + u + "Int32BE"](high, 0, true);
        }
        return b2;
      };
    };
    module2.exports.unpackInt64 = read64(false);
    module2.exports.unpackUInt64 = read64(true);
    module2.exports.packInt64 = write64(false);
    module2.exports.packUInt64 = write64(true);
    addBindings("Float32", "Float");
    addBindings("Float64", "Double");
  }
});

// node_modules/.pnpm/osc-min@1.1.2/node_modules/osc-min/lib/osc-utilities.js
var require_osc_utilities = __commonJS({
  "node_modules/.pnpm/osc-min@1.1.2/node_modules/osc-min/lib/osc-utilities.js"(exports2) {
    (function() {
      var IsArray, StrictError, TWO_POW_32, UNIX_EPOCH, binpack, getArrayArg, isOscBundleBuffer, makeTimetag, mapBundleList, oscTypeCodes, padding, toOscTypeAndArgs, hasProp = {}.hasOwnProperty;
      binpack = require_binpack();
      exports2.concat = function(buffers) {
        var buffer, copyTo, destBuffer, j, k, l, len, len1, len2, sumLength;
        if (!IsArray(buffers)) {
          throw new Error("concat must take an array of buffers");
        }
        for (j = 0, len = buffers.length; j < len; j++) {
          buffer = buffers[j];
          if (!Buffer.isBuffer(buffer)) {
            throw new Error("concat must take an array of buffers");
          }
        }
        sumLength = 0;
        for (k = 0, len1 = buffers.length; k < len1; k++) {
          buffer = buffers[k];
          sumLength += buffer.length;
        }
        destBuffer = new Buffer(sumLength);
        copyTo = 0;
        for (l = 0, len2 = buffers.length; l < len2; l++) {
          buffer = buffers[l];
          buffer.copy(destBuffer, copyTo);
          copyTo += buffer.length;
        }
        return destBuffer;
      };
      exports2.toOscString = function(str, strict) {
        var i, j, nullIndex, ref;
        if (!(typeof str === "string")) {
          throw new Error("can't pack a non-string into an osc-string");
        }
        nullIndex = str.indexOf("\0");
        if (nullIndex !== -1 && strict) {
          throw StrictError("Can't pack an osc-string that contains NULL characters");
        }
        if (nullIndex !== -1) {
          str = str.slice(0, nullIndex);
        }
        for (i = j = 0, ref = padding(str); 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          str += "\0";
        }
        return new Buffer(str);
      };
      exports2.splitOscString = function(buffer, strict) {
        var i, j, nullIndex, rawStr, ref, ref1, rest, splitPoint, str;
        if (!Buffer.isBuffer(buffer)) {
          throw StrictError("Can't split something that isn't a buffer");
        }
        rawStr = buffer.toString("utf8");
        nullIndex = rawStr.indexOf("\0");
        if (nullIndex === -1) {
          if (strict) {
            throw new Error("All osc-strings must contain a null character");
          }
          return {
            string: rawStr,
            rest: new Buffer(0)
          };
        }
        str = rawStr.slice(0, nullIndex);
        splitPoint = Buffer.byteLength(str) + padding(str);
        if (strict && splitPoint > buffer.length) {
          throw StrictError("Not enough padding for osc-string");
        }
        if (strict) {
          for (i = j = ref = Buffer.byteLength(str), ref1 = splitPoint; ref <= ref1 ? j < ref1 : j > ref1; i = ref <= ref1 ? ++j : --j) {
            if (buffer[i] !== 0) {
              throw StrictError("Not enough or incorrect padding for osc-string");
            }
          }
        }
        rest = buffer.slice(splitPoint, buffer.length);
        return {
          string: str,
          rest
        };
      };
      exports2.splitInteger = function(buffer, type) {
        var bytes, num, rest, value;
        if (type == null) {
          type = "Int32";
        }
        bytes = binpack["pack" + type](0).length;
        if (buffer.length < bytes) {
          throw new Error("buffer is not big enough for integer type");
        }
        num = 0;
        value = binpack["unpack" + type](buffer.slice(0, bytes), "big");
        rest = buffer.slice(bytes, buffer.length);
        return {
          integer: value,
          rest
        };
      };
      exports2.splitTimetag = function(buffer) {
        var a, b2, bytes, c, d, fractional, rest, seconds, type;
        type = "UInt32";
        bytes = binpack["pack" + type](0).length;
        if (buffer.length < bytes * 2) {
          throw new Error("buffer is not big enough to contain a timetag");
        }
        a = 0;
        b2 = bytes;
        seconds = binpack["unpack" + type](buffer.slice(a, b2), "big");
        c = bytes;
        d = bytes + bytes;
        fractional = binpack["unpack" + type](buffer.slice(c, d), "big");
        rest = buffer.slice(d, buffer.length);
        return {
          timetag: [seconds, fractional],
          rest
        };
      };
      UNIX_EPOCH = 2208988800;
      TWO_POW_32 = 4294967296;
      exports2.dateToTimetag = function(date) {
        return exports2.timestampToTimetag(date.getTime() / 1e3);
      };
      exports2.timestampToTimetag = function(secs) {
        var fracSeconds, wholeSecs;
        wholeSecs = Math.floor(secs);
        fracSeconds = secs - wholeSecs;
        return makeTimetag(wholeSecs, fracSeconds);
      };
      exports2.timetagToTimestamp = function(timetag) {
        var seconds;
        seconds = timetag[0] + exports2.ntpToFractionalSeconds(timetag[1]);
        return seconds - UNIX_EPOCH;
      };
      makeTimetag = function(unixseconds, fracSeconds) {
        var ntpFracs, ntpSecs;
        ntpSecs = unixseconds + UNIX_EPOCH;
        ntpFracs = Math.round(TWO_POW_32 * fracSeconds);
        return [ntpSecs, ntpFracs];
      };
      exports2.timetagToDate = function(timetag) {
        var date, dd, fracs, fractional, seconds;
        seconds = timetag[0], fractional = timetag[1];
        seconds = seconds - UNIX_EPOCH;
        fracs = exports2.ntpToFractionalSeconds(fractional);
        date = /* @__PURE__ */ new Date();
        date.setTime(seconds * 1e3 + fracs * 1e3);
        dd = /* @__PURE__ */ new Date();
        dd.setUTCFullYear(date.getUTCFullYear());
        dd.setUTCMonth(date.getUTCMonth());
        dd.setUTCDate(date.getUTCDate());
        dd.setUTCHours(date.getUTCHours());
        dd.setUTCMinutes(date.getUTCMinutes());
        dd.setUTCSeconds(date.getUTCSeconds());
        dd.setUTCMilliseconds(fracs * 1e3);
        return dd;
      };
      exports2.deltaTimetag = function(seconds, now) {
        var n;
        n = (now != null ? now : /* @__PURE__ */ new Date()) / 1e3;
        return exports2.timestampToTimetag(n + seconds);
      };
      exports2.ntpToFractionalSeconds = function(fracSeconds) {
        return parseFloat(fracSeconds) / TWO_POW_32;
      };
      exports2.toTimetagBuffer = function(timetag) {
        var high, low, type;
        if (typeof timetag === "number") {
          timetag = exports2.timestampToTimetag(timetag);
        } else if (typeof timetag === "object" && "getTime" in timetag) {
          timetag = exports2.dateToTimetag(timetag);
        } else if (timetag.length !== 2) {
          throw new Error("Invalid timetag" + timetag);
        }
        type = "UInt32";
        high = binpack["pack" + type](timetag[0], "big");
        low = binpack["pack" + type](timetag[1], "big");
        return exports2.concat([high, low]);
      };
      exports2.toIntegerBuffer = function(number, type) {
        if (type == null) {
          type = "Int32";
        }
        if (typeof number !== "number") {
          throw new Error("cannot pack a non-number into an integer buffer");
        }
        return binpack["pack" + type](number, "big");
      };
      oscTypeCodes = {
        s: {
          representation: "string",
          split: function(buffer, strict) {
            var split;
            split = exports2.splitOscString(buffer, strict);
            return {
              value: split.string,
              rest: split.rest
            };
          },
          toArg: function(value, strict) {
            if (typeof value !== "string") {
              throw new Error("expected string");
            }
            return exports2.toOscString(value, strict);
          }
        },
        i: {
          representation: "integer",
          split: function(buffer, strict) {
            var split;
            split = exports2.splitInteger(buffer);
            return {
              value: split.integer,
              rest: split.rest
            };
          },
          toArg: function(value, strict) {
            if (typeof value !== "number") {
              throw new Error("expected number");
            }
            return exports2.toIntegerBuffer(value);
          }
        },
        t: {
          representation: "timetag",
          split: function(buffer, strict) {
            var split;
            split = exports2.splitTimetag(buffer);
            return {
              value: split.timetag,
              rest: split.rest
            };
          },
          toArg: function(value, strict) {
            return exports2.toTimetagBuffer(value);
          }
        },
        f: {
          representation: "float",
          split: function(buffer, strict) {
            return {
              value: binpack.unpackFloat32(buffer.slice(0, 4), "big"),
              rest: buffer.slice(4, buffer.length)
            };
          },
          toArg: function(value, strict) {
            if (typeof value !== "number") {
              throw new Error("expected number");
            }
            return binpack.packFloat32(value, "big");
          }
        },
        d: {
          representation: "double",
          split: function(buffer, strict) {
            return {
              value: binpack.unpackFloat64(buffer.slice(0, 8), "big"),
              rest: buffer.slice(8, buffer.length)
            };
          },
          toArg: function(value, strict) {
            if (typeof value !== "number") {
              throw new Error("expected number");
            }
            return binpack.packFloat64(value, "big");
          }
        },
        b: {
          representation: "blob",
          split: function(buffer, strict) {
            var length, ref;
            ref = exports2.splitInteger(buffer), length = ref.integer, buffer = ref.rest;
            return {
              value: buffer.slice(0, length),
              rest: buffer.slice(length, buffer.length)
            };
          },
          toArg: function(value, strict) {
            var size;
            if (!Buffer.isBuffer(value)) {
              throw new Error("expected node.js Buffer");
            }
            size = exports2.toIntegerBuffer(value.length);
            return exports2.concat([size, value]);
          }
        },
        T: {
          representation: "true",
          split: function(buffer, strict) {
            return {
              rest: buffer,
              value: true
            };
          },
          toArg: function(value, strict) {
            if (!value && strict) {
              throw new Error("true must be true");
            }
            return new Buffer(0);
          }
        },
        F: {
          representation: "false",
          split: function(buffer, strict) {
            return {
              rest: buffer,
              value: false
            };
          },
          toArg: function(value, strict) {
            if (value && strict) {
              throw new Error("false must be false");
            }
            return new Buffer(0);
          }
        },
        N: {
          representation: "null",
          split: function(buffer, strict) {
            return {
              rest: buffer,
              value: null
            };
          },
          toArg: function(value, strict) {
            if (value && strict) {
              throw new Error("null must be false");
            }
            return new Buffer(0);
          }
        },
        I: {
          representation: "bang",
          split: function(buffer, strict) {
            return {
              rest: buffer,
              value: "bang"
            };
          },
          toArg: function(value, strict) {
            return new Buffer(0);
          }
        }
      };
      exports2.oscTypeCodeToTypeString = function(code) {
        var ref;
        return (ref = oscTypeCodes[code]) != null ? ref.representation : void 0;
      };
      exports2.typeStringToOscTypeCode = function(rep) {
        var code, str;
        for (code in oscTypeCodes) {
          if (!hasProp.call(oscTypeCodes, code)) continue;
          str = oscTypeCodes[code].representation;
          if (str === rep) {
            return code;
          }
        }
        return null;
      };
      exports2.argToTypeCode = function(arg, strict) {
        var code, value;
        if ((arg != null ? arg.type : void 0) != null && typeof arg.type === "string" && (code = exports2.typeStringToOscTypeCode(arg.type)) != null) {
          return code;
        }
        value = (arg != null ? arg.value : void 0) != null ? arg.value : arg;
        if (strict && value == null) {
          throw new Error("Argument has no value");
        }
        if (typeof value === "string") {
          return "s";
        }
        if (typeof value === "number") {
          return "f";
        }
        if (Buffer.isBuffer(value)) {
          return "b";
        }
        if (typeof value === "boolean") {
          if (value) {
            return "T";
          } else {
            return "F";
          }
        }
        if (value === null) {
          return "N";
        }
        throw new Error("I don't know what type this is supposed to be.");
      };
      exports2.splitOscArgument = function(buffer, type, strict) {
        var osctype;
        osctype = exports2.typeStringToOscTypeCode(type);
        if (osctype != null) {
          return oscTypeCodes[osctype].split(buffer, strict);
        } else {
          throw new Error("I don't understand how I'm supposed to unpack " + type);
        }
      };
      exports2.toOscArgument = function(value, type, strict) {
        var osctype;
        osctype = exports2.typeStringToOscTypeCode(type);
        if (osctype != null) {
          return oscTypeCodes[osctype].toArg(value, strict);
        } else {
          throw new Error("I don't know how to pack " + type);
        }
      };
      exports2.fromOscMessage = function(buffer, strict) {
        var address, arg, args, arrayStack, built, j, len, ref, ref1, type, typeString, types;
        ref = exports2.splitOscString(buffer, strict), address = ref.string, buffer = ref.rest;
        if (strict && address[0] !== "/") {
          throw StrictError("addresses must start with /");
        }
        if (!buffer.length) {
          return {
            address,
            args: []
          };
        }
        ref1 = exports2.splitOscString(buffer, strict), types = ref1.string, buffer = ref1.rest;
        if (types[0] !== ",") {
          if (strict) {
            throw StrictError("Argument lists must begin with ,");
          }
          return {
            address,
            args: []
          };
        }
        types = types.slice(1, +types.length + 1 || 9e9);
        args = [];
        arrayStack = [args];
        for (j = 0, len = types.length; j < len; j++) {
          type = types[j];
          if (type === "[") {
            arrayStack.push([]);
            continue;
          }
          if (type === "]") {
            if (arrayStack.length <= 1) {
              if (strict) {
                throw new StrictError("Mismatched ']' character.");
              }
            } else {
              built = arrayStack.pop();
              arrayStack[arrayStack.length - 1].push({
                type: "array",
                value: built
              });
            }
            continue;
          }
          typeString = exports2.oscTypeCodeToTypeString(type);
          if (typeString == null) {
            throw new Error("I don't understand the argument code " + type);
          }
          arg = exports2.splitOscArgument(buffer, typeString, strict);
          if (arg != null) {
            buffer = arg.rest;
          }
          arrayStack[arrayStack.length - 1].push({
            type: typeString,
            value: arg != null ? arg.value : void 0
          });
        }
        if (arrayStack.length !== 1 && strict) {
          throw new StrictError("Mismatched '[' character");
        }
        return {
          address,
          args,
          oscType: "message"
        };
      };
      exports2.fromOscBundle = function(buffer, strict) {
        var bundleTag, convertedElems, ref, ref1, timetag;
        ref = exports2.splitOscString(buffer, strict), bundleTag = ref.string, buffer = ref.rest;
        if (bundleTag !== "#bundle") {
          throw new Error("osc-bundles must begin with #bundle");
        }
        ref1 = exports2.splitTimetag(buffer), timetag = ref1.timetag, buffer = ref1.rest;
        convertedElems = mapBundleList(buffer, function(buffer2) {
          return exports2.fromOscPacket(buffer2, strict);
        });
        return {
          timetag,
          elements: convertedElems,
          oscType: "bundle"
        };
      };
      exports2.fromOscPacket = function(buffer, strict) {
        if (isOscBundleBuffer(buffer, strict)) {
          return exports2.fromOscBundle(buffer, strict);
        } else {
          return exports2.fromOscMessage(buffer, strict);
        }
      };
      getArrayArg = function(arg) {
        if (IsArray(arg)) {
          return arg;
        } else if ((arg != null ? arg.type : void 0) === "array" && IsArray(arg != null ? arg.value : void 0)) {
          return arg.value;
        } else if (arg != null && arg.type == null && IsArray(arg.value)) {
          return arg.value;
        } else {
          return null;
        }
      };
      toOscTypeAndArgs = function(argList, strict) {
        var arg, buff, j, len, oscargs, osctype, ref, thisArgs, thisType, typeCode, value;
        osctype = "";
        oscargs = [];
        for (j = 0, len = argList.length; j < len; j++) {
          arg = argList[j];
          if (getArrayArg(arg) != null) {
            ref = toOscTypeAndArgs(getArrayArg(arg), strict), thisType = ref[0], thisArgs = ref[1];
            osctype += "[" + thisType + "]";
            oscargs = oscargs.concat(thisArgs);
            continue;
          }
          typeCode = exports2.argToTypeCode(arg, strict);
          if (typeCode != null) {
            value = arg != null ? arg.value : void 0;
            if (value === void 0) {
              value = arg;
            }
            buff = exports2.toOscArgument(value, exports2.oscTypeCodeToTypeString(typeCode), strict);
            if (buff != null) {
              oscargs.push(buff);
              osctype += typeCode;
            }
          }
        }
        return [osctype, oscargs];
      };
      exports2.toOscMessage = function(message, strict) {
        var address, allArgs, args, old_arg, oscaddr, oscargs, osctype, ref;
        address = (message != null ? message.address : void 0) != null ? message.address : message;
        if (typeof address !== "string") {
          throw new Error("message must contain an address");
        }
        args = message != null ? message.args : void 0;
        if (args === void 0) {
          args = [];
        }
        if (!IsArray(args)) {
          old_arg = args;
          args = [];
          args[0] = old_arg;
        }
        oscaddr = exports2.toOscString(address, strict);
        ref = toOscTypeAndArgs(args, strict), osctype = ref[0], oscargs = ref[1];
        osctype = "," + osctype;
        allArgs = exports2.concat(oscargs);
        osctype = exports2.toOscString(osctype);
        return exports2.concat([oscaddr, osctype, allArgs]);
      };
      exports2.toOscBundle = function(bundle, strict) {
        var allElems, buff, e, elem, elements, elemstr, j, len, oscBundleTag, oscElems, oscTimeTag, ref, ref1, size, timetag;
        if (strict && (bundle != null ? bundle.timetag : void 0) == null) {
          throw StrictError("bundles must have timetags.");
        }
        timetag = (ref = bundle != null ? bundle.timetag : void 0) != null ? ref : /* @__PURE__ */ new Date();
        elements = (ref1 = bundle != null ? bundle.elements : void 0) != null ? ref1 : [];
        if (!IsArray(elements)) {
          elemstr = elements;
          elements = [];
          elements.push(elemstr);
        }
        oscBundleTag = exports2.toOscString("#bundle");
        oscTimeTag = exports2.toTimetagBuffer(timetag);
        oscElems = [];
        for (j = 0, len = elements.length; j < len; j++) {
          elem = elements[j];
          try {
            buff = exports2.toOscPacket(elem, strict);
            size = exports2.toIntegerBuffer(buff.length);
            oscElems.push(exports2.concat([size, buff]));
          } catch (error) {
            e = error;
            null;
          }
        }
        allElems = exports2.concat(oscElems);
        return exports2.concat([oscBundleTag, oscTimeTag, allElems]);
      };
      exports2.toOscPacket = function(bundleOrMessage, strict) {
        if ((bundleOrMessage != null ? bundleOrMessage.oscType : void 0) != null) {
          if (bundleOrMessage.oscType === "bundle") {
            return exports2.toOscBundle(bundleOrMessage, strict);
          }
          return exports2.toOscMessage(bundleOrMessage, strict);
        }
        if ((bundleOrMessage != null ? bundleOrMessage.timetag : void 0) != null || (bundleOrMessage != null ? bundleOrMessage.elements : void 0) != null) {
          return exports2.toOscBundle(bundleOrMessage, strict);
        }
        return exports2.toOscMessage(bundleOrMessage, strict);
      };
      exports2.applyMessageTranformerToBundle = function(transform) {
        return function(buffer) {
          var bundleTagBuffer, copyIndex, elem, elems, j, k, len, len1, lengthBuff, outBuffer, ref, string, timetagBuffer, totalLength;
          ref = exports2.splitOscString(buffer), string = ref.string, buffer = ref.rest;
          if (string !== "#bundle") {
            throw new Error("osc-bundles must begin with #bundle");
          }
          bundleTagBuffer = exports2.toOscString(string);
          timetagBuffer = buffer.slice(0, 8);
          buffer = buffer.slice(8, buffer.length);
          elems = mapBundleList(buffer, function(buffer2) {
            return exports2.applyTransform(buffer2, transform, exports2.applyMessageTranformerToBundle(transform));
          });
          totalLength = bundleTagBuffer.length + timetagBuffer.length;
          for (j = 0, len = elems.length; j < len; j++) {
            elem = elems[j];
            totalLength += 4 + elem.length;
          }
          outBuffer = new Buffer(totalLength);
          bundleTagBuffer.copy(outBuffer, 0);
          timetagBuffer.copy(outBuffer, bundleTagBuffer.length);
          copyIndex = bundleTagBuffer.length + timetagBuffer.length;
          for (k = 0, len1 = elems.length; k < len1; k++) {
            elem = elems[k];
            lengthBuff = exports2.toIntegerBuffer(elem.length);
            lengthBuff.copy(outBuffer, copyIndex);
            copyIndex += 4;
            elem.copy(outBuffer, copyIndex);
            copyIndex += elem.length;
          }
          return outBuffer;
        };
      };
      exports2.applyTransform = function(buffer, mTransform, bundleTransform) {
        if (bundleTransform == null) {
          bundleTransform = exports2.applyMessageTranformerToBundle(mTransform);
        }
        if (isOscBundleBuffer(buffer)) {
          return bundleTransform(buffer);
        } else {
          return mTransform(buffer);
        }
      };
      exports2.addressTransform = function(transform) {
        return function(buffer) {
          var ref, rest, string;
          ref = exports2.splitOscString(buffer), string = ref.string, rest = ref.rest;
          string = transform(string);
          return exports2.concat([exports2.toOscString(string), rest]);
        };
      };
      exports2.messageTransform = function(transform) {
        return function(buffer) {
          var message;
          message = exports2.fromOscMessage(buffer);
          return exports2.toOscMessage(transform(message));
        };
      };
      IsArray = Array.isArray;
      StrictError = function(str) {
        return new Error("Strict Error: " + str);
      };
      padding = function(str) {
        var bufflength;
        bufflength = Buffer.byteLength(str);
        return 4 - bufflength % 4;
      };
      isOscBundleBuffer = function(buffer, strict) {
        var string;
        string = exports2.splitOscString(buffer, strict).string;
        return string === "#bundle";
      };
      mapBundleList = function(buffer, func) {
        var e, elem, elems, j, len, nonNullElems, size, thisElemBuffer;
        elems = (function() {
          var ref, results;
          results = [];
          while (buffer.length) {
            ref = exports2.splitInteger(buffer), size = ref.integer, buffer = ref.rest;
            if (size > buffer.length) {
              throw new Error("Invalid bundle list: size of element is bigger than buffer");
            }
            thisElemBuffer = buffer.slice(0, size);
            buffer = buffer.slice(size, buffer.length);
            try {
              results.push(func(thisElemBuffer));
            } catch (error) {
              e = error;
              results.push(null);
            }
          }
          return results;
        })();
        nonNullElems = [];
        for (j = 0, len = elems.length; j < len; j++) {
          elem = elems[j];
          if (elem != null) {
            nonNullElems.push(elem);
          }
        }
        return nonNullElems;
      };
    }).call(exports2);
  }
});

// node_modules/.pnpm/osc-min@1.1.2/node_modules/osc-min/lib/index.js
var require_lib = __commonJS({
  "node_modules/.pnpm/osc-min@1.1.2/node_modules/osc-min/lib/index.js"(exports2) {
    (function() {
      var utils, coffee;
      utils = require_osc_utilities();
      exports2.fromBuffer = function(buffer, strict) {
        if (buffer instanceof ArrayBuffer) {
          buffer = new Buffer(new Uint8Array(buffer));
        } else if (buffer instanceof Uint8Array) {
          buffer = new Buffer(buffer);
        }
        return utils.fromOscPacket(buffer, strict);
      };
      exports2.toBuffer = function(object, strict, opt) {
        if (typeof object === "string")
          return utils.toOscPacket({ "address": object, "args": strict }, opt);
        return utils.toOscPacket(object, strict);
      };
      exports2.applyAddressTransform = function(buffer, transform) {
        return utils.applyTransform(buffer, utils.addressTransform(transform));
      };
      exports2.applyMessageTransform = function(buffer, transform) {
        return utils.applyTransform(buffer, utils.messageTransform(transform));
      };
      exports2.timetagToDate = utils.timetagToDate;
      exports2.dateToTimetag = utils.dateToTimetag;
      exports2.timetagToTimestamp = utils.timetagToTimestamp;
      exports2.timestampToTimetag = utils.timestampToTimetag;
    }).call(exports2);
  }
});

// start.js
var import_url3 = require("url");
var import_path3 = __toESM(require("path"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_child_process = require("child_process");

// node_modules/.pnpm/ws@8.18.3/node_modules/ws/wrapper.mjs
var import_stream = __toESM(require_stream(), 1);
var import_receiver = __toESM(require_receiver(), 1);
var import_sender = __toESM(require_sender(), 1);
var import_websocket = __toESM(require_websocket(), 1);
var import_websocket_server = __toESM(require_websocket_server(), 1);
var wrapper_default = import_websocket.default;

// server.js
var import_dgram = __toESM(require("dgram"), 1);
var import_net = __toESM(require("net"), 1);
var import_osc_min = __toESM(require_lib(), 1);
var import_os = __toESM(require("os"), 1);
var import_path = __toESM(require("path"), 1);
var import_url = require("url");
var import_meta = {};
var _rootValue;
try {
  _rootValue = __dirname;
} catch (e) {
  _rootValue = import_meta && import_meta.url ? import_path.default.dirname((0, import_url.fileURLToPath)(import_meta.url)) : process.cwd();
}
var TuioBridgeServer = class {
  constructor(options = {}) {
    this.wsPort = options.wsPort || 8080;
    this.udpHost = options.udpHost || "127.0.0.1";
    this.udpPort = options.udpPort || 3333;
    this.tcpPort = options.tcpPort || 3333;
    this.udpListenPort = options.udpListenPort || 3333;
    this.wss = null;
    this.wsClients = /* @__PURE__ */ new Set();
    this.udpClient = null;
    this.udpServer = null;
    this.tcpServer = null;
    this.frameId = 0;
    this.activeCursors = /* @__PURE__ */ new Map();
    this.activeObjects = /* @__PURE__ */ new Map();
    this.activeBlobs = /* @__PURE__ */ new Map();
  }
  /**
   * 启动服务器
   */
  start() {
    this.udpClient = import_dgram.default.createSocket("udp4");
    this.udpServer = import_dgram.default.createSocket("udp4");
    this.udpServer.on("message", (msg, rinfo) => {
      console.log(`
[UDP Server] ===== \u6536\u5230UDP\u6D88\u606F =====`);
      console.log(`[UDP Server] \u6765\u6E90: ${rinfo.address}:${rinfo.port}`);
      console.log(`[UDP Server] \u6D88\u606F\u957F\u5EA6: ${msg.length} \u5B57\u8282`);
      console.log(`[UDP Server] \u65F6\u95F4\u6233: ${(/* @__PURE__ */ new Date()).toISOString()}`);
      this.handleOSCMessage(msg, `UDP:${rinfo.address}:${rinfo.port}`);
      console.log(`[UDP Server] ========================
`);
    });
    this.udpServer.on("error", (err) => {
      console.error("[UDP Server] \u9519\u8BEF:", err);
      console.error("[UDP Server] \u9519\u8BEF\u8BE6\u60C5:", err.message, err.code);
    });
    this.udpServer.on("listening", () => {
      const address = this.udpServer.address();
      console.log(`
[TUIO Bridge] ==========================================`);
      console.log(`[TUIO Bridge] \u2713 UDP \u670D\u52A1\u5668\u5DF2\u542F\u52A8`);
      console.log(`[TUIO Bridge]   \u76D1\u542C\u5730\u5740: ${address.address}`);
      console.log(`[TUIO Bridge]   \u76D1\u542C\u7AEF\u53E3: ${address.port}`);
      console.log(`[TUIO Bridge]   \u534F\u8BAE: UDP/IPv4`);
      console.log(`[TUIO Bridge]   \u51C6\u5907\u63A5\u6536\u6765\u81EA\u624B\u673A\u7684TUIO\u6D88\u606F...`);
      const interfaces = import_os.default.networkInterfaces();
      const ips = [];
      for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
          if (iface.family === "IPv4" && !iface.internal) {
            ips.push(iface.address);
          }
        }
      }
      if (ips.length > 0) {
        console.log(`[TUIO Bridge] \u63D0\u793A: \u8BF7\u5728\u624B\u673ATUIOpad\u4E2D\u914D\u7F6E\u4EE5\u4E0BIP\u5730\u5740\u4E4B\u4E00:`);
        ips.forEach((ip) => console.log(`[TUIO Bridge]   - Host: ${ip}, Port: ${address.port}, Protocol: UDP`));
      }
      console.log(`[TUIO Bridge] ==========================================
`);
    });
    this.udpServer.bind(this.udpListenPort, "0.0.0.0", (err) => {
      if (err) {
        console.error(`[TUIO Bridge] \u2717 UDP \u670D\u52A1\u5668\u7ED1\u5B9A\u5931\u8D25:`, err);
        console.error(`[TUIO Bridge] \u9519\u8BEF\u8BE6\u60C5:`, err.message, err.code);
        if (err.code === "EADDRINUSE") {
          console.error(`[TUIO Bridge] \u7AEF\u53E3 ${this.udpListenPort} \u5DF2\u88AB\u5360\u7528\uFF01`);
        }
      } else {
      }
    });
    this.tcpServer = import_net.default.createServer((socket) => {
      const clientInfo = `${socket.remoteAddress}:${socket.remotePort}`;
      console.log(`[TCP Server] \u65B0\u5BA2\u6237\u7AEF\u8FDE\u63A5: ${clientInfo}`);
      let buffer = Buffer.alloc(0);
      socket.on("data", (data) => {
        console.log(`[TCP Server] \u6536\u5230\u6570\u636E\u6765\u81EA ${clientInfo}, \u957F\u5EA6: ${data.length} \u5B57\u8282`);
        buffer = Buffer.concat([buffer, data]);
        this.processTCPBuffer(buffer, (remainingBuffer) => {
          buffer = remainingBuffer;
        }, clientInfo);
      });
      socket.on("close", () => {
        console.log(`[TCP Server] \u5BA2\u6237\u7AEF\u65AD\u5F00\u8FDE\u63A5: ${clientInfo}`);
      });
      socket.on("error", (err) => {
        console.error(`[TCP Server] \u9519\u8BEF (${clientInfo}):`, err);
      });
    });
    this.tcpServer.listen(this.tcpPort, "0.0.0.0", () => {
      const address = this.tcpServer.address();
      console.log(`[TUIO Bridge] TCP \u670D\u52A1\u5668\u76D1\u542C\u5728 ${address.address}:${address.port} (\u63A5\u6536\u6765\u81EA\u624B\u673A\u7684TCP\u6D88\u606F)`);
    });
    this.tcpServer.on("error", (err) => {
      console.error("[TCP Server] \u670D\u52A1\u5668\u9519\u8BEF:", err);
    });
    try {
      this.wss = new import_websocket_server.default({ port: this.wsPort });
      this.wss.on("connection", (ws) => {
        console.log(`[WebSocket] \u65B0\u5BA2\u6237\u7AEF\u8FDE\u63A5: ${ws._socket.remoteAddress}`);
        this.wsClients.add(ws);
        ws.on("message", (data) => {
          try {
            const message = JSON.parse(data.toString());
            this.handleWebSocketMessage(message);
          } catch (error) {
            console.error("[\u9519\u8BEF] \u89E3\u6790 WebSocket \u6D88\u606F\u5931\u8D25:", error);
          }
        });
        ws.on("close", () => {
          console.log("[WebSocket] \u5BA2\u6237\u7AEF\u65AD\u5F00\u8FDE\u63A5");
          this.wsClients.delete(ws);
          this.sendAliveMessage();
        });
        ws.on("error", (error) => {
          console.error("[WebSocket] \u5BA2\u6237\u7AEF\u9519\u8BEF:", error);
          this.wsClients.delete(ws);
        });
      });
      this.wss.on("error", (error) => {
        console.error(`[WebSocket Server] \u670D\u52A1\u5668\u9519\u8BEF:`, error);
        if (error.code === "EADDRINUSE") {
          console.error(`[\u9519\u8BEF] \u7AEF\u53E3 ${this.wsPort} \u5DF2\u88AB\u5360\u7528\uFF0C\u8BF7\u5173\u95ED\u5360\u7528\u8BE5\u7AEF\u53E3\u7684\u7A0B\u5E8F\u6216\u66F4\u6539\u7AEF\u53E3`);
        }
      });
      this.wss.on("listening", () => {
        console.log(`[TUIO Bridge] WebSocket \u670D\u52A1\u5668\u542F\u52A8\u5728\u7AEF\u53E3 ${this.wsPort}`);
        console.log(`[TUIO Bridge] UDP \u76EE\u6807: ${this.udpHost}:${this.udpPort}`);
        console.log(`[TUIO Bridge] \u7B49\u5F85\u5BA2\u6237\u7AEF\u8FDE\u63A5...`);
        console.log(`[TUIO Bridge] \u652F\u6301\u4E24\u79CD\u6A21\u5F0F:`);
        console.log(`  - \u53D1\u9001\u6A21\u5F0F: \u524D\u7AEF \u2192 WebSocket \u2192 UDP/OSC`);
        console.log(`  - \u63A5\u6536\u6A21\u5F0F: \u624B\u673ATUIOpad \u2192 TCP/UDP \u2192 WebSocket \u2192 \u524D\u7AEF`);
      });
    } catch (error) {
      console.error(`[TUIO Bridge] \u542F\u52A8WebSocket\u670D\u52A1\u5668\u5931\u8D25:`, error);
      if (error.code === "EADDRINUSE") {
        console.error(`[\u9519\u8BEF] \u7AEF\u53E3 ${this.wsPort} \u5DF2\u88AB\u5360\u7528`);
      }
      throw error;
    }
  }
  /**
   * 处理来自手机的OSC消息（TCP/UDP）
   * 支持单个OSC消息和OSC bundle格式
   */
  handleOSCMessage(buffer, source) {
    try {
      console.log(`[OSC] \u6536\u5230\u6D88\u606F (${source}), \u7F13\u51B2\u533A\u957F\u5EA6: ${buffer.length} \u5B57\u8282`);
      console.log(`[OSC] \u7F13\u51B2\u533A\u524D32\u5B57\u8282 (hex):`, buffer.slice(0, Math.min(32, buffer.length)).toString("hex"));
      const isBundle = buffer.length >= 8 && buffer.slice(0, 8).toString("ascii").startsWith("#bundle");
      if (isBundle) {
        console.log(`[OSC] \u68C0\u6D4B\u5230OSC Bundle\u683C\u5F0F`);
        this.handleOSCBundle(buffer, source);
      } else {
        const oscMessage = import_osc_min.default.fromBuffer(buffer);
        console.log(`[OSC] \u2713 \u89E3\u6790\u6210\u529F: \u5730\u5740=${oscMessage.address}, \u53C2\u6570\u6570\u91CF=${oscMessage.args?.length || 0}`);
        if (oscMessage.args && oscMessage.args.length > 0) {
          console.log(`[OSC] \u7B2C\u4E00\u4E2A\u53C2\u6570\u7C7B\u578B: ${oscMessage.args[0].type}, \u503C: ${oscMessage.args[0].value}`);
        }
        this.processOSCMessage(oscMessage, source);
      }
    } catch (error) {
      console.error(`[OSC] \u2717 \u89E3\u6790\u9519\u8BEF (${source}):`, error.message);
      console.error(`[OSC] \u9519\u8BEF\u5806\u6808:`, error.stack);
      console.error(`[OSC] \u7F13\u51B2\u533A\u5185\u5BB9 (\u524D64\u5B57\u8282 hex):`, buffer.slice(0, Math.min(64, buffer.length)).toString("hex"));
      console.error(`[OSC] \u7F13\u51B2\u533A\u5185\u5BB9 (\u524D64\u5B57\u8282 ascii):`, buffer.slice(0, Math.min(64, buffer.length)).toString("ascii").replace(/[^\x20-\x7E]/g, "."));
    }
  }
  /**
   * 处理OSC Bundle格式
   * OSC Bundle格式: "#bundle" + 时间戳 + [长度(4字节) + OSC消息]...
   */
  handleOSCBundle(buffer, source) {
    try {
      let offset = 8;
      const timeTag = buffer.slice(offset, offset + 8);
      offset += 8;
      console.log(`[OSC Bundle] \u65F6\u95F4\u6233:`, timeTag.toString("hex"));
      while (offset < buffer.length) {
        if (offset + 4 > buffer.length) {
          break;
        }
        const messageLength = buffer.readUInt32BE(offset);
        offset += 4;
        if (messageLength === 0 || offset + messageLength > buffer.length) {
          break;
        }
        const messageBuffer = buffer.slice(offset, offset + messageLength);
        offset += messageLength;
        offset = Math.ceil(offset / 4) * 4;
        try {
          const oscMessage = import_osc_min.default.fromBuffer(messageBuffer);
          console.log(`[OSC Bundle] \u2713 \u89E3\u6790bundle\u4E2D\u7684\u6D88\u606F: \u5730\u5740=${oscMessage.address}, \u53C2\u6570\u6570\u91CF=${oscMessage.args?.length || 0}`);
          this.processOSCMessage(oscMessage, source);
        } catch (error) {
          console.error(`[OSC Bundle] \u2717 \u89E3\u6790bundle\u4E2D\u7684\u6D88\u606F\u5931\u8D25:`, error.message);
        }
      }
      const messageCount = Math.floor((offset - 16) / 4);
      console.log(`[OSC Bundle] \u2713 Bundle\u5904\u7406\u5B8C\u6210`);
    } catch (error) {
      console.error(`[OSC Bundle] \u2717 Bundle\u5904\u7406\u9519\u8BEF:`, error.message);
      console.error(`[OSC Bundle] \u9519\u8BEF\u5806\u6808:`, error.stack);
    }
  }
  /**
   * 处理TCP缓冲区（OSC消息可能分多个TCP包）
   * OSC消息在TCP中通常以长度前缀（4字节）开头，然后是OSC消息内容
   */
  processTCPBuffer(buffer, callback, source) {
    let offset = 0;
    while (offset + 4 <= buffer.length) {
      try {
        const messageLength = buffer.readUInt32BE(offset);
        if (offset + 4 + messageLength > buffer.length) {
          break;
        }
        const oscBuffer = buffer.slice(offset + 4, offset + 4 + messageLength);
        const oscMessage = import_osc_min.default.fromBuffer(oscBuffer);
        this.processOSCMessage(oscMessage, source);
        offset += 4 + messageLength;
      } catch (error) {
        try {
          const oscMessage = import_osc_min.default.fromBuffer(buffer.slice(offset));
          const messageLength = import_osc_min.default.toBuffer(oscMessage).length;
          this.processOSCMessage(oscMessage, source);
          offset += Math.ceil(messageLength / 4) * 4;
        } catch (error2) {
          break;
        }
      }
    }
    callback(buffer.slice(offset));
  }
  /**
   * 处理解析后的OSC消息，转换为JSON并通过WebSocket广播
   */
  processOSCMessage(oscMessage, source) {
    const address = oscMessage.address;
    console.log(`[TUIO] \u5904\u7406\u6D88\u606F: ${address} (\u6765\u6E90: ${source})`);
    if (!address.startsWith("/tuio/")) {
      console.log(`[TUIO] \u8DF3\u8FC7\u975ETUIO\u6D88\u606F: ${address}`);
      return;
    }
    const args = oscMessage.args || [];
    if (args.length === 0) {
      return;
    }
    const command = args[0].value;
    if (address === "/tuio/2Dcur") {
      console.log(`[TUIO] \u5904\u74062Dcur\u6D88\u606F, \u547D\u4EE4: ${command}, \u53C2\u6570\u6570\u91CF: ${args.length}`);
      if (command === "set" && args.length >= 6) {
        const sessionId = args[1].value;
        const x = args[2].value;
        const y = args[3].value;
        const xSpeed = args[4].value;
        const ySpeed = args[5].value;
        const motionAccel = args[6]?.value || 0;
        console.log(`[TUIO] 2Dcur set: sessionId=${sessionId}, x=${x}, y=${y}`);
        const isNew = !this.activeCursors.has(sessionId);
        this.activeCursors.set(sessionId, { x, y, xSpeed, ySpeed, motionAccel });
        this.broadcastToWebSocket({
          type: "cursor",
          action: isNew ? "add" : "update",
          sessionId,
          x,
          y,
          xSpeed,
          ySpeed,
          motionAccel,
          source: "tuio-app"
        });
      } else if (command === "alive") {
        console.log(`[TUIO] 2Dcur alive: ${args.length - 1} \u4E2A\u6D3B\u52A8\u5149\u6807`);
        const aliveIds = args.slice(1).map((arg) => arg.value);
        const currentIds = Array.from(this.activeCursors.keys());
        const toRemove = currentIds.filter((id) => !aliveIds.includes(id));
        toRemove.forEach((sessionId) => {
          this.activeCursors.delete(sessionId);
          this.broadcastToWebSocket({
            type: "cursor",
            action: "remove",
            sessionId,
            source: "tuio-app"
          });
        });
      } else if (command === "fseq") {
        this.frameId = args[1]?.value || this.frameId;
        console.log(`[TUIO] 2Dcur fseq: frameId=${this.frameId}`);
      } else {
        console.log(`[TUIO] 2Dcur \u672A\u77E5\u547D\u4EE4: ${command}, \u53C2\u6570\u6570\u91CF: ${args.length}`);
      }
    } else if (address === "/tuio/2Dobj") {
      if (command === "set" && args.length >= 9) {
        const sessionId = args[1].value;
        const symbolId = args[2].value;
        const x = args[3].value;
        const y = args[4].value;
        const angle = args[5].value;
        const xSpeed = args[6].value;
        const ySpeed = args[7].value;
        const rotationSpeed = args[8].value;
        const motionAccel = args[9]?.value || 0;
        const rotationAccel = args[10]?.value || 0;
        const isNew = !this.activeObjects.has(sessionId);
        this.activeObjects.set(sessionId, { symbolId, x, y, angle, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel });
        this.broadcastToWebSocket({
          type: "object",
          action: isNew ? "add" : "update",
          sessionId,
          symbolId,
          x,
          y,
          angle,
          xSpeed,
          ySpeed,
          rotationSpeed,
          motionAccel,
          rotationAccel,
          source: "tuio-app"
        });
      } else if (command === "alive") {
        const aliveIds = args.slice(1).map((arg) => arg.value);
        const currentIds = Array.from(this.activeObjects.keys());
        const toRemove = currentIds.filter((id) => !aliveIds.includes(id));
        toRemove.forEach((sessionId) => {
          this.activeObjects.delete(sessionId);
          this.broadcastToWebSocket({
            type: "object",
            action: "remove",
            sessionId,
            source: "tuio-app"
          });
        });
      }
    } else if (address === "/tuio/2Dblb") {
      if (command === "set" && args.length >= 11) {
        const sessionId = args[1].value;
        const x = args[2].value;
        const y = args[3].value;
        const angle = args[4].value;
        const width = args[5].value;
        const height = args[6].value;
        const area = args[7].value;
        const xSpeed = args[8].value;
        const ySpeed = args[9].value;
        const rotationSpeed = args[10].value;
        const motionAccel = args[11]?.value || 0;
        const rotationAccel = args[12]?.value || 0;
        const isNew = !this.activeBlobs.has(sessionId);
        this.activeBlobs.set(sessionId, { x, y, angle, width, height, area, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel });
        this.broadcastToWebSocket({
          type: "blob",
          action: isNew ? "add" : "update",
          sessionId,
          x,
          y,
          angle,
          width,
          height,
          area,
          xSpeed,
          ySpeed,
          rotationSpeed,
          motionAccel,
          rotationAccel,
          source: "tuio-app"
        });
      } else if (command === "alive") {
        const aliveIds = args.slice(1).map((arg) => arg.value);
        const currentIds = Array.from(this.activeBlobs.keys());
        const toRemove = currentIds.filter((id) => !aliveIds.includes(id));
        toRemove.forEach((sessionId) => {
          this.activeBlobs.delete(sessionId);
          this.broadcastToWebSocket({
            type: "blob",
            action: "remove",
            sessionId,
            source: "tuio-app"
          });
        });
      }
    }
  }
  /**
   * 广播消息给所有WebSocket客户端
   */
  broadcastToWebSocket(message) {
    const data = JSON.stringify(message);
    const clientCount = this.wsClients.size;
    console.log(`[WebSocket] \u5E7F\u64AD\u6D88\u606F\u7ED9 ${clientCount} \u4E2A\u5BA2\u6237\u7AEF:`, message.type, message.action || "");
    this.wsClients.forEach((client) => {
      if (client.readyState === wrapper_default.OPEN) {
        try {
          client.send(data);
        } catch (error) {
          console.error("[WebSocket] \u5E7F\u64AD\u6D88\u606F\u5931\u8D25:", error);
        }
      } else {
        console.warn(`[WebSocket] \u5BA2\u6237\u7AEF\u72B6\u6001\u4E0D\u662FOPEN: ${client.readyState}`);
      }
    });
  }
  /**
   * 处理 WebSocket 消息
   */
  handleWebSocketMessage(message) {
    switch (message.type) {
      case "cursor":
        this.handleCursor(message);
        break;
      case "object":
        this.handleObject(message);
        break;
      case "blob":
        this.handleBlob(message);
        break;
      case "frame":
        this.sendFrame();
        break;
      case "reset":
        this.reset();
        break;
      default:
        console.warn("[\u8B66\u544A] \u672A\u77E5\u7684\u6D88\u606F\u7C7B\u578B:", message.type);
    }
  }
  /**
   * 处理光标（触摸点）消息
   */
  handleCursor(message) {
    const { action, sessionId, x, y, xSpeed, ySpeed, motionAccel } = message;
    switch (action) {
      case "add":
        this.activeCursors.set(sessionId, { x, y, xSpeed, ySpeed, motionAccel });
        this.sendCursorMessage("set", sessionId, x, y, xSpeed, ySpeed, motionAccel);
        break;
      case "update":
        if (this.activeCursors.has(sessionId)) {
          this.activeCursors.set(sessionId, { x, y, xSpeed, ySpeed, motionAccel });
          this.sendCursorMessage("set", sessionId, x, y, xSpeed, ySpeed, motionAccel);
        }
        break;
      case "remove":
        if (this.activeCursors.has(sessionId)) {
          this.sendCursorMessage("alive", sessionId);
          this.activeCursors.delete(sessionId);
        }
        break;
    }
  }
  /**
   * 处理对象（标记物）消息
   */
  handleObject(message) {
    const { action, sessionId, symbolId, x, y, angle, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel } = message;
    switch (action) {
      case "add":
        this.activeObjects.set(sessionId, { symbolId, x, y, angle, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel });
        this.sendObjectMessage("set", sessionId, symbolId, x, y, angle, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel);
        break;
      case "update":
        if (this.activeObjects.has(sessionId)) {
          this.activeObjects.set(sessionId, { symbolId, x, y, angle, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel });
          this.sendObjectMessage("set", sessionId, symbolId, x, y, angle, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel);
        }
        break;
      case "remove":
        if (this.activeObjects.has(sessionId)) {
          this.sendObjectMessage("alive", sessionId);
          this.activeObjects.delete(sessionId);
        }
        break;
    }
  }
  /**
   * 处理 Blob 消息
   */
  handleBlob(message) {
    const { action, sessionId, x, y, angle, width, height, area, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel } = message;
    switch (action) {
      case "add":
        this.activeBlobs.set(sessionId, { x, y, angle, width, height, area, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel });
        this.sendBlobMessage("set", sessionId, x, y, angle, width, height, area, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel);
        break;
      case "update":
        if (this.activeBlobs.has(sessionId)) {
          this.activeBlobs.set(sessionId, { x, y, angle, width, height, area, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel });
          this.sendBlobMessage("set", sessionId, x, y, angle, width, height, area, xSpeed, ySpeed, rotationSpeed, motionAccel, rotationAccel);
        }
        break;
      case "remove":
        if (this.activeBlobs.has(sessionId)) {
          this.sendBlobMessage("alive", sessionId);
          this.activeBlobs.delete(sessionId);
        }
        break;
    }
  }
  /**
   * 发送光标 OSC 消息
   */
  sendCursorMessage(type, sessionId, x = 0, y = 0, xSpeed = 0, ySpeed = 0, motionAccel = 0) {
    if (type === "alive") {
      const oscMessage = {
        address: "/tuio/2Dcur",
        args: [
          { type: "s", value: "alive" },
          { type: "i", value: sessionId }
        ]
      };
      this.sendOSCMessage(oscMessage);
    } else {
      const oscMessage = {
        address: "/tuio/2Dcur",
        args: [
          { type: "s", value: "set" },
          { type: "i", value: sessionId },
          { type: "f", value: x },
          { type: "f", value: y },
          { type: "f", value: xSpeed },
          { type: "f", value: ySpeed },
          { type: "f", value: motionAccel }
        ]
      };
      this.sendOSCMessage(oscMessage);
    }
  }
  /**
   * 发送对象 OSC 消息
   */
  sendObjectMessage(type, sessionId, symbolId = 0, x = 0, y = 0, angle = 0, xSpeed = 0, ySpeed = 0, rotationSpeed = 0, motionAccel = 0, rotationAccel = 0) {
    if (type === "alive") {
      const oscMessage = {
        address: "/tuio/2Dobj",
        args: [
          { type: "s", value: "alive" },
          { type: "i", value: sessionId }
        ]
      };
      this.sendOSCMessage(oscMessage);
    } else {
      const oscMessage = {
        address: "/tuio/2Dobj",
        args: [
          { type: "s", value: "set" },
          { type: "i", value: sessionId },
          { type: "i", value: symbolId },
          { type: "f", value: x },
          { type: "f", value: y },
          { type: "f", value: angle },
          { type: "f", value: xSpeed },
          { type: "f", value: ySpeed },
          { type: "f", value: rotationSpeed },
          { type: "f", value: motionAccel },
          { type: "f", value: rotationAccel }
        ]
      };
      this.sendOSCMessage(oscMessage);
    }
  }
  /**
   * 发送 Blob OSC 消息
   */
  sendBlobMessage(type, sessionId, x = 0, y = 0, angle = 0, width = 0, height = 0, area = 0, xSpeed = 0, ySpeed = 0, rotationSpeed = 0, motionAccel = 0, rotationAccel = 0) {
    if (type === "alive") {
      const oscMessage = {
        address: "/tuio/2Dblb",
        args: [
          { type: "s", value: "alive" },
          { type: "i", value: sessionId }
        ]
      };
      this.sendOSCMessage(oscMessage);
    } else {
      const oscMessage = {
        address: "/tuio/2Dblb",
        args: [
          { type: "s", value: "set" },
          { type: "i", value: sessionId },
          { type: "f", value: x },
          { type: "f", value: y },
          { type: "f", value: angle },
          { type: "f", value: width },
          { type: "f", value: height },
          { type: "f", value: area },
          { type: "f", value: xSpeed },
          { type: "f", value: ySpeed },
          { type: "f", value: rotationSpeed },
          { type: "f", value: motionAccel },
          { type: "f", value: rotationAccel }
        ]
      };
      this.sendOSCMessage(oscMessage);
    }
  }
  /**
   * 发送 OSC 消息到 UDP
   */
  sendOSCMessage(oscMessage) {
    try {
      const buffer = import_osc_min.default.toBuffer(oscMessage);
      this.udpClient.send(buffer, 0, buffer.length, this.udpPort, this.udpHost, (err) => {
        if (err) {
          console.error("[UDP] \u53D1\u9001\u9519\u8BEF:", err);
        }
      });
    } catch (error) {
      console.error("[OSC] \u6D88\u606F\u6784\u5EFA\u9519\u8BEF:", error);
    }
  }
  /**
   * 发送帧消息
   */
  sendFrame() {
    const aliveCursors = Array.from(this.activeCursors.keys());
    const aliveObjects = Array.from(this.activeObjects.keys());
    const aliveBlobs = Array.from(this.activeBlobs.keys());
    if (aliveCursors.length > 0) {
      const aliveArgs = [
        { type: "s", value: "alive" },
        ...aliveCursors.map((id) => ({ type: "i", value: id }))
      ];
      const aliveMessage = {
        address: "/tuio/2Dcur",
        args: aliveArgs
      };
      this.sendOSCMessage(aliveMessage);
    }
    if (aliveObjects.length > 0) {
      const aliveArgs = [
        { type: "s", value: "alive" },
        ...aliveObjects.map((id) => ({ type: "i", value: id }))
      ];
      const aliveMessage = {
        address: "/tuio/2Dobj",
        args: aliveArgs
      };
      this.sendOSCMessage(aliveMessage);
    }
    if (aliveBlobs.length > 0) {
      const aliveArgs = [
        { type: "s", value: "alive" },
        ...aliveBlobs.map((id) => ({ type: "i", value: id }))
      ];
      const aliveMessage = {
        address: "/tuio/2Dblb",
        args: aliveArgs
      };
      this.sendOSCMessage(aliveMessage);
    }
    const fseqMessage = {
      address: "/tuio/2Dcur",
      args: [
        { type: "s", value: "fseq" },
        { type: "i", value: this.frameId }
      ]
    };
    this.sendOSCMessage(fseqMessage);
    const fseqObjMessage = {
      address: "/tuio/2Dobj",
      args: [
        { type: "s", value: "fseq" },
        { type: "i", value: this.frameId }
      ]
    };
    this.sendOSCMessage(fseqObjMessage);
    const fseqBlbMessage = {
      address: "/tuio/2Dblb",
      args: [
        { type: "s", value: "fseq" },
        { type: "i", value: this.frameId }
      ]
    };
    this.sendOSCMessage(fseqBlbMessage);
    this.frameId++;
  }
  /**
   * 发送 alive 消息（用于清理）
   */
  sendAliveMessage() {
    const aliveMessage = {
      address: "/tuio/2Dcur",
      args: [{ type: "s", value: "alive" }]
    };
    this.sendOSCMessage(aliveMessage);
    this.sendFrame();
  }
  /**
   * 重置所有状态
   */
  reset() {
    this.activeCursors.clear();
    this.activeObjects.clear();
    this.activeBlobs.clear();
    this.frameId = 0;
    this.sendAliveMessage();
    console.log("[TUIO Bridge] \u72B6\u6001\u5DF2\u91CD\u7F6E");
  }
  /**
   * 停止服务器
   */
  stop() {
    if (this.wss) {
      this.wss.close();
    }
    if (this.udpClient) {
      this.udpClient.close();
    }
    if (this.udpServer) {
      this.udpServer.close();
    }
    if (this.tcpServer) {
      this.tcpServer.close();
    }
    console.log("[TUIO Bridge] \u670D\u52A1\u5668\u5DF2\u505C\u6B62");
  }
};
var WS_PORT = process.env.WS_PORT || 8080;
var TUIO_UDP_HOST = process.env.TUIO_UDP_HOST || "127.0.0.1";
var TUIO_UDP_PORT = process.env.TUIO_UDP_PORT || 3333;
var TUIO_TCP_PORT = process.env.TUIO_TCP_PORT || 3333;
var TUIO_UDP_LISTEN_PORT = process.env.UDP_LISTEN_PORT || 3333;
function startBridge(options = {}) {
  const server = new TuioBridgeServer({
    wsPort: options.wsPort || WS_PORT,
    udpHost: options.udpHost || TUIO_UDP_HOST,
    udpPort: options.udpPort || TUIO_UDP_PORT,
    tcpPort: options.tcpPort || TUIO_TCP_PORT,
    udpListenPort: options.udpListenPort || TUIO_UDP_LISTEN_PORT
  });
  server.start();
  return server;
}

// static-server.js
var import_http = __toESM(require("http"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_url2 = require("url");
var import_meta2 = {};
var MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "application/font-woff",
  ".woff2": "application/font-woff2",
  ".ttf": "application/font-ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".otf": "application/font-otf"
};
var _rootValue2;
try {
  _rootValue2 = __dirname;
} catch (e) {
  _rootValue2 = import_meta2 && import_meta2.url ? import_path2.default.dirname((0, import_url2.fileURLToPath)(import_meta2.url)) : process.cwd();
}
var PROJECT_ROOT = _rootValue2;
function startStaticServer(options = {}) {
  const PORT = options.port || process.env.STATIC_PORT || 8001;
  const server = import_http.default.createServer((req, res) => {
    let filePath = "." + req.url;
    if (filePath === "./") {
      filePath = "./login.html";
    }
    filePath = filePath.split("?")[0];
    if (filePath === "./animation.html") {
      fullPath = import_path2.default.join(PROJECT_ROOT, "public/dist-animation/index.html");
    } else if (filePath.startsWith("./assets/") && !import_fs.default.existsSync(import_path2.default.join(PROJECT_ROOT, "public", filePath))) {
      const animAssetsPath = import_path2.default.join(PROJECT_ROOT, "public/dist-animation", filePath);
      if (import_fs.default.existsSync(animAssetsPath)) {
        fullPath = animAssetsPath;
      } else {
        fullPath = import_path2.default.join(PROJECT_ROOT, "public", filePath);
      }
    } else {
      fullPath = import_path2.default.join(PROJECT_ROOT, "public", filePath);
    }
    console.log(`[\u9759\u6001\u6587\u4EF6\u670D\u52A1\u5668] \u8BF7\u6C42: ${req.url} -> \u6620\u5C04\u8DEF\u5F84: ${fullPath}`);
    const extname = String(import_path2.default.extname(fullPath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || "application/octet-stream";
    import_fs.default.readFile(fullPath, (error, content) => {
      if (error) {
        if (error.code === "ENOENT") {
          console.error(`[\u9759\u6001\u6587\u4EF6\u670D\u52A1\u5668] 404 - \u6587\u4EF6\u672A\u627E\u5230: ${fullPath}`);
          res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
          res.end(`<h1>404 - \u6587\u4EF6\u672A\u627E\u5230</h1><p>\u5C1D\u8BD5\u8DEF\u5F84: ${fullPath}</p>`, "utf-8");
        } else {
          res.writeHead(500);
          res.end(`\u670D\u52A1\u5668\u9519\u8BEF: ${error.code}`, "utf-8");
        }
      } else {
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content, "utf-8");
      }
    });
  });
  server.listen(PORT, () => {
    console.log(`[\u9759\u6001\u6587\u4EF6\u670D\u52A1\u5668] \u542F\u52A8\u5728\u7AEF\u53E3 ${PORT}`);
    console.log(`[\u9759\u6001\u6587\u4EF6\u670D\u52A1\u5668] \u8BBF\u95EE\u5730\u5740: http://localhost:${PORT}`);
    console.log(`[\u9759\u6001\u6587\u4EF6\u670D\u52A1\u5668] \u767B\u5F55\u9875\u9762: http://localhost:${PORT}/login.html`);
    console.log(`[\u9759\u6001\u6587\u4EF6\u670D\u52A1\u5668] \u5BFC\u89C8\u9875\u9762: http://localhost:${PORT}/navigation.html`);
  });
  return server;
}

// start.js
var import_meta3 = {};
var _rootValue3;
try {
  _rootValue3 = __dirname;
} catch (e) {
  _rootValue3 = import_meta3 && import_meta3.url ? (0, import_path3.dirname)((0, import_url3.fileURLToPath)(import_meta3.url)) : process.cwd();
}
var PROJECT_ROOT2 = _rootValue3;
var colors = {
  reset: "\x1B[0m",
  bright: "\x1B[1m",
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[35m",
  cyan: "\x1B[36m"
};
function timestamp() {
  return (/* @__PURE__ */ new Date()).toLocaleTimeString("zh-CN", { hour12: false });
}
function log(module2, message, color = "reset") {
  const colorCode = colors[color] || colors.reset;
  console.log(`${colorCode}[${timestamp()}] [${module2}] ${message}${colors.reset}`);
}
function openBrowser(url) {
  const command = process.platform === "win32" ? `start ${url}` : process.platform === "darwin" ? `open ${url}` : `xdg-open ${url}`;
  (0, import_child_process.exec)(command);
  log("\u4E3B\u8FDB\u7A0B", `\u5DF2\u81EA\u52A8\u6253\u5F00\u6D4F\u89C8\u5668: ${url}`, "green");
}
var processes = [];
function shutdown() {
  log("\u4E3B\u8FDB\u7A0B", "\u6B63\u5728\u5173\u95ED\u6240\u6709\u670D\u52A1...", "yellow");
  processes.forEach(({ name, process: process2 }) => {
    try {
      log(name, "\u6B63\u5728\u505C\u6B62...", "yellow");
      process2.kill("SIGTERM");
    } catch (error) {
      log(name, `\u5173\u95ED\u9519\u8BEF: ${error.message}`, "red");
    }
  });
  setTimeout(() => {
    log("\u4E3B\u8FDB\u7A0B", "\u6240\u6709\u670D\u52A1\u5DF2\u5173\u95ED", "green");
    process.exit(0);
  }, 1e3);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
if (!process.pkg) {
  const animStudioPath = (0, import_path3.join)(PROJECT_ROOT2, "animation-studio");
  if (import_fs2.default.existsSync(animStudioPath)) {
    log("\u4E3B\u8FDB\u7A0B", "\u6B63\u5728\u7F16\u8BD1 animation-studio \u6A21\u5757...", "cyan");
    try {
      (0, import_child_process.execSync)("pnpm --filter led-animation-studio build", { cwd: PROJECT_ROOT2, stdio: "inherit" });
      log("\u4E3B\u8FDB\u7A0B", "animation-studio \u7F16\u8BD1\u5B8C\u6210", "green");
    } catch (error) {
      log("\u4E3B\u8FDB\u7A0B", `\u7F16\u8BD1\u5931\u8D25: ${error.message}`, "red");
    }
  } else {
    log("\u4E3B\u8FDB\u7A0B", "\u672A\u627E\u5230 animation-studio \u6A21\u5757\uFF0C\u8DF3\u8FC7\u7F16\u8BD1", "yellow");
  }
} else {
  log("\u4E3B\u8FDB\u7A0B", "\u8FD0\u884C\u5728\u5C01\u88C5\u6A21\u5F0F\uFF0C\u8DF3\u8FC7\u7F16\u8BD1\u6B65\u9AA4", "cyan");
}
log("\u4E3B\u8FDB\u7A0B", "\u5F00\u59CB\u542F\u52A8\u6838\u5FC3\u670D\u52A1...", "bright");
log("TUIO Bridge", "\u542F\u52A8\u4E2D...", "cyan");
try {
  startBridge({
    wsPort: 8080,
    udpHost: "127.0.0.1",
    udpPort: 3333,
    tcpPort: 3333,
    udpListenPort: 3333
  });
} catch (error) {
  log("TUIO Bridge", `\u542F\u52A8\u5931\u8D25: ${error.message}`, "red");
}
setTimeout(() => {
  log("Static Server", "\u542F\u52A8\u4E2D...", "cyan");
  try {
    startStaticServer({ port: 8001 });
  } catch (error) {
    log("Static Server", `\u542F\u52A8\u5931\u8D25: ${error.message}`, "red");
  }
  setTimeout(() => {
    openBrowser("http://localhost:8001");
  }, 1e3);
  setTimeout(() => {
    console.log("\n" + "=".repeat(60));
    log("\u4E3B\u8FDB\u7A0B", "\u6240\u6709\u670D\u52A1\u5DF2\u542F\u52A8\uFF01", "green");
    console.log("\n\u8BBF\u95EE\u5730\u5740:");
    console.log(`  ${colors.cyan}\u9759\u6001\u6587\u4EF6\u670D\u52A1\u5668:${colors.reset} http://localhost:8001 (\u767B\u5F55\u9875\u9762)`);
    console.log(`  ${colors.cyan}WebSocket \u670D\u52A1\u5668:${colors.reset} ws://localhost:8080`);
    console.log(`  ${colors.cyan}\u52A8\u753B\u64AD\u653E/\u5BFC\u89C8:${colors.reset}  http://localhost:8001/navigation.html`);
    console.log("\n" + "=".repeat(60));
    console.log(`
\u6309 ${colors.yellow}Ctrl+C${colors.reset} \u505C\u6B62\u6240\u6709\u670D\u52A1
`);
  }, 2e3);
}, 1e3);
