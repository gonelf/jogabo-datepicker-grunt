// extends Surface to save moment in each element

define('MomentSurface', function(require, exports, module) {
    var Surface = require('famous/core/Surface');
    var Moment = require('moment');
    var moment;
    /**
     * A surface containing moment content.
     *   This extends the Surface class.
     *
     * @class MomentSurface
     *
     * @extends Surface
     * @constructor
     * @param {Object} [options] overrides of default options
     */
    function MomentSurface(options) {
        this.moment = undefined;
        Surface.apply(this, arguments);
    }

    MomentSurface.prototype = Object.create(Surface.prototype);
    MomentSurface.prototype.constructor = MomentSurface;
    MomentSurface.prototype.elementType = 'div';
    MomentSurface.prototype.elementClass = 'famous-surface';
    /**
     * Set content Moment.  
     * @method setContent
     * @param {moment} moment
     */
    MomentSurface.prototype.setMoment = function setMoment(momentData) {
        this.moment = momentData;
    }

    MomentSurface.prototype.getMoment = function getMoment() {
        return this.moment;
    }

    MomentSurface.prototype.selected = function selected () {
        this.removeClass('unselected');
        this.addClass('selected');
    }

    MomentSurface.prototype.selectedRound = function selectedRound() {
        this.removeClass('unselected');
        this.addClass('selectedDay');
    };

    MomentSurface.prototype.unselected = function unselected () {
        this.removeClass('selectedDay');
        this.removeClass('selected');
        this.addClass('unselected');
    }

    module.exports = MomentSurface;
});