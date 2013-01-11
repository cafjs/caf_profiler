/*!
Copyright 2013 Hewlett-Packard Development Company, L.P.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

"use strict";
/**
 * Performance profiler component. Measures latency, throughput and queue
 * length for CA requests.
 *
 *
 * It should be defined in framework.json with name 'profiler'.
 *
 * @name caf_profiler/plug_profiler
 * @namespace
 * @augments gen_plug
 */
var caf = require('caf_core');
var genPlug = caf.gen_plug;

var metrics = require('metrics');

var traceProfiler = require('./trace_profiler');


/**
 * Factory method to create a profiler component.
 * @see sup_main
 */
exports.newInstance = function(context, spec, secrets, cb) {

    var $ = context;

    var timer = new metrics.Timer();
    var inReq = new metrics.Counter();
    var outReq = new metrics.Counter();
    var queued = new metrics.Counter();
    var report = new metrics.Report();
    var prefix = 'ca_' + $.cf.getAppHost();
    // metrics uses '.' for scoping and host is an IP address
    prefix = prefix.replace(/\./g, '_');
    prefix = prefix + '.';
    report.addMetric(prefix + 'inReq', inReq);
    report.addMetric(prefix + 'outReq', outReq);
    report.addMetric(prefix + 'pending', queued);
    report.addMetric(prefix + 'stats', timer);

    var that = genPlug.constructor(spec, secrets);


    /**
     *  Starts profiling
     *
     * @name caf_profiler/plug_profiler#begin
     * @function
     */
    that.begin = function() {
        inReq.inc();
        queued.inc();
        if (process.uptime) { // >= node v0.6.X
            // better than msec resolution in Linux
             return process.uptime();
        } else {
            return Date.now();
        }
    };

    /**
     *  Ends profiling
     *
     * @param {number} start Starting time.
     *
     * @name caf_profiler/plug_profiler#end
     * @function
     */
     that.end = function(start) {
        outReq.inc();
        queued.dec();
        var diff;
        if (process.uptime) {
            diff = (process.uptime() - start) * 1000;
        } else {
            diff = Date.now() - start;
        }
        timer.update(diff);
        return diff;
    };

    /**
     * Generates a performance report.
     *
     *
     * @name caf_profiler/plug_profiler#report
     * @function
     *
     */
    that.report = function() {
        return report.summary();
    };

    var errorMsg = 'Trace profiler not enabled: set env property' +
    ' traceProfiler in plug_profiler (i.e., in framework.json config file)';

    /**
     * Starts sampling # of pending messages.
     *
     *
     * @name caf_profiler/plug_profiler#startTraceProfiler
     * @function
     *
     */
    that.startTraceProfiler = function() {
        if (that.profiler) {
            return 'Error: Trace profiler already running';
        } else {
            if (spec.env.traceProfiler) {
                var samplerF = function() {
                    return queued.count;
                };
                that.profiler = traceProfiler.newTracer(spec.env.traceProfiler,
                                                        samplerF);
                return that.profiler.start();
            } else {
                return errorMsg;
            }
        }
    };

    /**
     * Stops sampling # of pending messages.
     *
     *
     * @name caf_profiler/plug_profiler#stopTraceProfiler
     * @function
     *
     */
    that.stopTraceProfiler = function() {
        if (that.profiler) {
            var prof = that.profiler;
            delete that.profiler;
            return prof.stop();
        } else {
            if (spec.env.traceProfiler) {
                return 'Error: Trace profiler not started';
            } else {
                return errorMsg;
            }
        }
    };

    /**
     * Adds a custom event to the trace sampling # of pending messages.
     *
     *  @param {caf.json} event A custom event to add to the trace.
     *
     * @name caf_profiler/plug_profiler#addEventTraceProfiler
     * @function
     */
     that.addEventTraceProfiler = function(event) {
        if (that.profiler) {
            return that.profiler.addEvent(event);
        } else {
            return errorMsg;
        }
    };

    $.log && $.log.debug('New profiler plug');
    cb(null, that);
};
