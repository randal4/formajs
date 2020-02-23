/*! FormaJS v0.0.1 | (c) Krasen Slavov | formaja.com/license */
'use strict';
(($) => {
    /* Forma is jQuery extension that can help create a dynamic and 
     * interactive forms that can give basic instructions of the 
     * different states and help the user to quickly complete forms.
     */
    $.forma = (options) => {

        const settings = $.extend({
            container: '.forma',
            manual: false,
            show: false,
            auto: false,
            support: [
                'input[type="text"]',
                'input[type="email"]',
                'input[type="password"]', 
                'input[type="url"]',
                'input[type="number"]',
                'input[type="submit"]', 
                'input[type="reset"]',
                'select', 
                'textarea',
                'button',
                // 'input[type="file"]', 
            ],
        }, options);

        /* Convert a container passed as string into an HTML element.
         */
        if (typeof settings.container === 'string') {
            settings.container = $(settings.container);
        }

        /* Assing the passed container into a local variable.
         */
        const form = settings.container;

        /* When the passed element cannot be found or is not a 
         * form show a console error message.
         */
        if (form.length === 0
            || form.get(0).localName !== 'form') {
            console.error('Not found! Form element is not defined or does not exist into the DOM.');
            return false;
        }

        /* Get all the elements out of the passed form.
         */
        const elems = Object.values(form.get(0).elements);

        /* Have the ability to toggle form blocks manually.
         */
        if (settings.manual === true) {
            let formLabels = form.find('label');
            formLabels.on({
                click: (event) => {
                    let self = $(event.currentTarget);
                    if (event.target !== event.currentTarget) {
                        return false;
                    }
                    self.toggleClass('forma-open');
                }
            }).addClass('forma-manual');
        }

        /* By default all form elements are hidden 
         * (except the first one), if show option is 
         * set to true we make them visible.
         */
        form.find('label:first-of-type')
            .addClass('forma-open')
            .attr('autofocus', true);

        if (settings.show === true) {
            form.find('label').addClass('forma-open');
        }

        let currElem, // current form element e.g $('select').
            currSpan, // current span element.
            currSpanText,
            locName; // local name of the current element e.g. select, input[type="text"], textarea, etc.

         /* Loop throught all the from elements and apply the magic.
          */
         elems.map((el, idx) => {

            currElem = $(elems[idx]);
            locName = currElem.get(0).localName;

            /* Since not all input types are supported convert input 
             * tag local names into e.g. input[type="text"].
             */
            if (locName === 'input') {
                locName = `${locName}[type="${currElem.get(0).type}"]`;
            }

            /* Check if the from element is found in the support 
             * array, if not return an error message into the console.
             */
            if ($.inArray(locName, settings.support) > -1) {

                /* Add some auto-generated content into our form.
                 * Generate description text & placholder based 
                 * element label.
                 */
                if (settings.auto === true) {

                    /* Add form field auto-genearted description text if
                     * the em isn't found inside the span.
                     */
                    currSpan = currElem.closest('label').find('span');
                    currSpanText = currSpan.text().toLowerCase();

                    if ($('em', currSpan).length === 0) {
                        currSpan.append($('<em />').text(`Enter ${ currSpanText}...`));
                    }

                    /* Auto-generated placeholder attribute.
                     */
                    currElem.attr('placeholder', `Enter ${ currSpanText}...`);
                }

                /* Add tabindex attribute into all form elements.
                 */
                currElem.attr('tabindex', idx);

                /*
                 */
                currElem.on({
                    'click change keyup': (event) => {

                        let self = $(event.currentTarget);
                        let spanElem = self.closest('label').find('span');

                        /* Show up form element content and highlight it 
                         * as valid/invalid based on the form fields 
                         * rules e.g required, minlength, min etc.
                         */
                        if (!spanElem.find('strong').length) {
                            spanElem.append($('<strong />'));
                        }

                        if (self.is(':valid')) {
                            spanElem.find('strong').addClass('valid').removeClass('invalid');
                            spanElem.find('em').hide();
                        } else {
                            spanElem.find('strong').addClass('invalid').removeClass('valid');
                            form.addClass('invalid');
                        }

                         /* Don't show password value on auto-typed.
                         */
                        if (self.get(0).type === 'password') {
                            spanElem.find('strong').empty().append(self.val().length + ' characters');
                        } else {
                            spanElem.find('strong').empty().append(self.val());
                        }
                    },
                    keydown: (event) => {

                        /*
                         */
                        if (event.which === 9) {

                            event.preventDefault();

                            let self = $(event.currentTarget);
                            let spanElem = self.closest('label').find('span');
                            let next = form.find('label.forma-open').next();

                            /* Handle validation error outputs.
                             */
                            $(self).on({
                                blur: (event) => {
                                    self = $(event.currentTarget);
                                    if (self.get(0).validationMessage) {
                                        spanElem.addClass('invalid');
                                        /* Extending validation with patterns and custom
                                         * message stored inside title.
                                         */
                                        if (self.get(0).pattern && self.get(0).title) {
                                            spanElem.attr('data-rules', self.get(0).title);
                                        } else {
                                            spanElem.attr('data-rules', self.get(0).validationMessage);
                                        }
                                        form.addClass('invalid');
                                    } else {
                                        spanElem.removeClass('invalid');
                                        spanElem.removeAttr('data-rules');
                                        /* If submit button is set to disabled on 
                                         * load check and if no errors are found enable 
                                         * the button for action.
                                         */
                                        if (form.find('.invalid').length === 0) {
                                            form.find('button[type="submit"]').removeAttr('disabled');
                                        }
                                        // form.hasClass('invalid');
                                    }
                                }
                            });

                            /* Remove the active state for the current form field.
                             */
                            form.find('label.forma-open').removeClass('forma-open');

                            /* Loop trought elements within the form without allowing 
                             * the tab to go ourside the form fields.
                             */
                            if (next.length === 0 
                                || next.find(`${settings.support.join(',')}`).get(0) === undefined) {
                                form.find('label:first-of-type').addClass('forma-open');
                                form.find('label:first-of-type').find(`${settings.support.join(',')}`).focus();
                            } else {
                                next.addClass('forma-open'); 
                                next.find(`${settings.support.join(',')}`).focus();
                            }

                            return false;  
                        }
                    }
                });

            } else {
                console.error(`Not supported! Currently ${locName} isn't a supported form field.`);
                return false;
            }
         });
    };
})(jQuery);