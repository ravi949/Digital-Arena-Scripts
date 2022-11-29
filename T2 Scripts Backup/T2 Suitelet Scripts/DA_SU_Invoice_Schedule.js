/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(['N/ui/serverWidget', 'N/search', 'N/format', 'N/encode', 'N/file', 'N/record','N/render'],
    function(ui, search, format, encode, file, record,render) {
        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {
            try {
                var request = context.request;
                var response = context.response;
                log.debug('params', (request.parameters));
                if (context.request.method === 'GET') {
                    log.debug("get");
                    var form = ui.createForm({
                        title: 'Invoicing Schedule'
                    });
                    form.addSubmitButton({
                        label: 'Post'
                    });
                     /*var tab = form.addSubtab({
                        id: 'custpage_tab',
                        label: 'Report'
                    });*/
                     var paginationField = form.addField({
                        id: 'custpage_posting_period',
                        type: ui.FieldType.SELECT,
                        label: 'posting period',
                        source: 'accountingperiod'
                    });
                     }
             context.response.writePage(form);
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        return {
            onRequest: onRequest
        };
    });