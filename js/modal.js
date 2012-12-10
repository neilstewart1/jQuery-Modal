/*!
 * @name        jQuery Modal
 * @author      Matt Hinchliffe <https://github.com/i-like-robots/jQuery-Modal>
 * @modified    10/12/2012
 * @version     1.0.0
 */
(function( $, undefined ) {

    'use strict';

    function Modal( target, options ) {

        this.opts = $.extend({}, {
            onopen: undefined,
            onhide: undefined,
            onupdate: undefined,
            fixed: false,
            overlay: true,
            blur: true,
            escape: true,
            width: 640,
            maxWidth: '95%',
            height: 480,
            maxHeight: '95%'
        }, options);

        this.target = target;

        this.isOpen = false;
        this.isInitialized = false;

        return this;
    }

    /**
     * Instantiate
     * @description Create the structure on first run
     */
    Modal.prototype._init = function() {

        this.doc = $(document);

        this.wrapper = $('<div class="modal-wrapper">').css({
            position: this.opts.fixed ? 'fixed' : 'absolute',
            width: this.opts.width,
            maxWidth: this.opts.maxWidth,
            height: this.opts.height,
            maxHeight: this.opts.maxHeight,
            display: 'none'
        });

        this.close = $('<span class="modal-close" data-toggle="modal">Close</span>').appendTo(this.wrapper);
        this.content = $('<div class="modal-content">').appendTo(this.wrapper);

        this.wrapper.appendTo(this.target);

        // Define overlay to prevent errors
        this.overlay = false;

        if ( this.opts.overlay ) {
            this.overlay = $('<div class="modal-overlay"' + (this.opts.blur ? 'data-toggle="modal"' : '') + '>')
                .css({
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    display: 'none'
                })
                .appendTo(this.target);
        }

        // Context appropriate metrics and events
        this.isBody = (this.target === document.body);
        this.context = this.isBody ? $(window) : $(this.target).css('position', 'relative');

        this.isInitialized = true;
    };

    /**
     * Align
     * @description Centre modal window and size overlay to fit
     */
    Modal.prototype.align = function() {

        var height = this.wrapper.outerHeight(),
            width = this.wrapper.outerWidth(),
            maxHeight = this.context.outerHeight(),
            maxWidth = this.context.outerWidth(),
            top = this.opts.fixed ? 0 : this.context.scrollTop();

        this.wrapper.css({
            top: height < maxHeight ? ( (maxHeight - height ) / 2 ) + top : top,
            left: width < maxWidth ? (maxWidth - width) / 2 : 0
        });

        if ( this.opts.overlay ) {
            this.overlay.css('height', this.isBody ? this.doc.height() : maxHeight );
        }
    };

    /**
     * Open
     * @description Open the modal window
     * @param {object} content
     * @param {function} callback
     */
    Modal.prototype.open = function( content, callback ) {

        if ( ! this.isInitialized) {
            this._init();
        }

        var self = this;

        if ( this.isBody ) {
            this.context.on('resize.modal', function() {
                self.align();
            });

            this.doc.on('keyup.modal', function( e ) {
                if ( e.keyCode === 27 ) {
                    self.hide();
                }
            });
        }

        this.doc.on('click.modal', '[data-toggle="modal"]', function( e ) {
            e.preventDefault();
            self.hide();
        });

        // Fade in
        this.wrapper
            .add(this.overlay)
            .stop()
            .fadeIn();

        this.isOpen = true;

        // Add content to window
        if ( content ) {
            this.update(content);
        }

        // Callbacks
        if ( this.opts.onopen ) {
            this.opts.onopen.call(this);
        }
        if ( callback ) {
            callback.call(this);
        }
    };

    /**
     * Update
     * @description Update the modal window contents
     * @param {object|string} content
     * @param {function} callback
     */
    Modal.prototype.update = function( content, callback ) {

        this.content.html(content);

        if ( this.isOpen ) {
            this.align();
        }

        // Callbacks
        if ( this.opts.onupdate ) {
            this.opts.onupdate.call(this);
        }
        if ( callback )
        {
            callback.call(this);
        }
    };

    /**
     * Resize
     * @description Resizes the modal window content area
     * @param {numeric|string} width
     * @param {numeric|string} height
     */
    Modal.prototype.resize = function( width, height ) {
        this.wrapper.css({
            width: width,
            height: height
        });

        this.align();
    };

    /**
     * Hide
     * @description Hide the modal window
     * @param {function} callback
     */
    Modal.prototype.hide = function( callback ) {

        // Unbind events
        this.doc.off('.modal');

        this.wrapper
            .add(this.overlay)
            .stop()
            .fadeOut();

        this.isOpen = false;

        // Callbacks
        if ( this.opts.onhide ) {
            this.opts.onhide.call(this);
        }
        if ( callback ) {
            callback.call(this);
        }
    };

    // jQuery plugin wrapper
    $.fn.modal = function( options ) {
        return this.each(function() {
            if ( ! $.data(this, 'modal') ) {
                $.data(this, 'modal', new Modal(this, options) );
            }
        });
    };

})(jQuery);