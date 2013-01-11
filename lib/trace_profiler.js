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
 * Evaluates periodically a sampling function and queues results. It dumps
 * results when stopped.
 *
 */
var caf = require('caf_core');
var genCron = caf.gen_cron;

exports.newTracer = function(config, samplerF) {

    var spec = {};
    spec.env = config;
    var that = genCron.constructor(spec, {});

    that.queue = [];
    var super_start = that.superior('start');
    that.start = function() {
        var doSampleF = function() {
            that.queue.push(samplerF());
        };
        super_start(doSampleF);
        return 'Trace profiler running';
    };

    var super_stop = that.superior('stop');
    that.stop = function() {
        super_stop();
        var queue = that.queue;
        that.queue = [];
        return queue;
    };

    that.addEvent = function(event) {
        that.queue.push(event);
        return 'ok';
    };

    return that;
};
