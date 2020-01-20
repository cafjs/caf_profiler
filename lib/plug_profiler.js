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

'use strict';
/**
 * Performance profiler component.
 *
 * Measures latency, throughput, and queue length for CA requests.
 *
 *
 * It should be declared in `framework.json` with name `profiler`.
 *
 * @module caf_profiler/plug_profiler
 * @augments external:caf_components/gen_plug
 */
// @ts-ignore: augments not attached to a class
const caf_comp = require('caf_components');
const genPlug = caf_comp.gen_plug;
const metrics = require('metrics');

exports.newInstance = async function($, spec) {
    try {
        const that = genPlug.create($, spec);
        $._.$.log && $._.$.log.debug('New profiler plug');

        const timer = new metrics.Timer();
        const inReq = new metrics.Counter();
        const pending = new metrics.Counter();
        const report = new metrics.Report();
        let prefix = 'node_' +
                  ($._.$.nodes && $._.$.nodes.getPrivateNodeId() || 'unknown');
        // metrics uses '.' for scoping and host is an IP address
        prefix = prefix.replace(/\./g, '_');
        prefix = prefix + '.';
        report.addMetric(prefix + 'requests', inReq);
        report.addMetric(prefix + 'pending', pending);
        report.addMetric(prefix + 'stats', timer);

        /**
         *  Starts profiling a message.
         *
         * @return {Array.<number>} Current high-resolution time in [seconds,
         *                           nanoseconds].
         *
         * @memberof! module:caf_profiler/plug_profiler#
         * @alias msgBegin
         */
        that.msgBegin = function() {
            inReq.inc();
            pending.inc();
            return process.hrtime();
        };

        /**
         *  Ends profiling a message
         *
         * @param {Array.<number>} start Starting high-resolution time.
         *
         * @return {Array.<number>} Elapsed high-resolution time in [seconds,
         *                           nanoseconds].
         *
         * @memberof! module:caf_profiler/plug_profiler#
         * @alias msgEnd
         */
        that.msgEnd = function(start) {
            pending.dec();
            // @ts-ignore
            const diff = process.hrtime(/* @type [number, number] */(start));
            timer.update(Math.round((diff[0]*1e9 + diff[1])/1000));
            return diff;
        };

        /**
         * Generates a performance report.
         *
         * @return {Object} A summary object with performance metrics.
         * See `metrics` package.
         *
         * @memberof! module:caf_profiler/plug_profiler#
         * @alias report
         *
         */
        that.report = function() {
            return report.summary();
        };

        return [null, that];
    } catch (err) {
        return [err];
    }
};
