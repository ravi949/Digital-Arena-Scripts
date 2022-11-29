/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(['N/runtime', 'N/config','N/search'],
    /**
     * @param {search} search
     */
    function(runtime, config, search) {
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
                if (context.request.method == 'GET') {
                    log.debug('params', context.request.parameters);
                    var params = context.request.parameters;
                    if (params.subsidairiesExists) {
                        var configRecObj = config.load({
                            type: config.Type.COMPANY_INFORMATION
                        });
                        var accountId = configRecObj.getValue('companyid');
                        accountId = accountId.replace(/_/g, '-');
                        var logourl = "";
                        var origin = "https://" + accountId + ".app.netsuite.com";
                        var subsidiaryId = params.subsidiaryId;
                        var subsidiaryRecord = record.load({
                            type: 'subsidiary',
                            id: subsidiaryId
                        });
                        if (subsidiaryRecord.getValue('logo')) {
                            var fieldLookUpForUrl = search.lookupFields({
                                type: 'file',
                                id: subsidiaryRecord.getValue('logo'),
                                columns: ['url']
                            });
                            log.debug('fieldLookUpurl', fieldLookUpForUrl.url);
                            logourl = origin + "" + fieldLookUpForUrl.url;
                        }
                        context.response.write(JSON.stringify({
                            success: true,
                            logoURL: logourl
                        }));
                    } else {
                        var configRecObj = config.load({
                            type: config.Type.COMPANY_INFORMATION
                        });
                        var accountId = configRecObj.getValue('companyid');
                        accountId = accountId.replace(/_/g, '-');
                        var logourl = "";
                        var origin = "https://" + accountId + ".app.netsuite.com";
                        var companyLogo = configRecObj.getValue('pagelogo');
                        if (companyLogo) {
                            var fieldLookUpForUrl = search.lookupFields({
                                type: 'file',
                                id: companyLogo,
                                columns: ['url']
                            });
                            log.debug('fieldLookUpurl', fieldLookUpForUrl.url);
                            logourl = origin + "" + fieldLookUpForUrl.url;
                        }
                        context.response.write(JSON.stringify({
                            success: true,
                            logoURL: logourl
                        }));
                    }
                }
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        return {
            onRequest: onRequest
        };
    });