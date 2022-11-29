/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope TargetAccount
 */
define(['N/search', 'N/runtime', 'N/record', 'N/url', 'N/config'],
    function(search, runtime, record, url, config) {
        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type
         * @param {Form} scriptContext.form - Current form
         * @Since 2015.2
         */
        function beforeLoad(scriptContext) {
            try {} catch (ex) {
                log.error(ex.name, ex.message);
            }
        }
        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function beforeSubmit(scriptContext) {
            try {
                var featureEnabled = runtime.isFeatureInEffect({
                    feature: 'SUBSIDIARIES'
                });
                log.debug(featureEnabled);
                var configRecObj = config.load({
                    type: config.Type.COMPANY_INFORMATION
                });
                var accountId = configRecObj.getValue('companyid');
                accountId = accountId.replace(/_/g, '-');
                var logourl = "";
                var origin = "https://" + accountId + ".app.netsuite.com";
                if (featureEnabled) {
                    var ids = scriptContext.newRecord.getFields();
                    log.debug('beforeSubmit', ids);
                    log.debug('arr', find("empsubsidiary", ids)[0]);
                    log.debug('logo', find("logo_url", ids)[0]);
                    var subsidairyId = scriptContext.newRecord.getValue(find("empsubsidiary", ids)[0]);
                    log.debug(subsidairyId);
                    var subsidiaryRecord = record.load({
                        type: 'subsidiary',
                        id: subsidairyId
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
                } else {
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
                }
                log.debug('logourl', logourl);
              	scriptContext.newRecord.setValue(find("logo_url", ids)[0],logourl);
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
            log.debug('beforeSubmit');
        }

        function find(key, array) {
            // The variable results needs var in this case (without 'var' a global variable is created)
            var results = [];
            for (var i = 0; i < array.length; i++) {
                //console.log(array[i].indexOf(key));
                if (array[i].indexOf(key) != -1) {
                    results.push(array[i]);
                }
            }
            return results;
        }
        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function afterSubmit(scriptContext) {
            try {} catch (ex) {
                log.error(ex.name, ex.message);
            }
        }

        function removeDuplicateUsingFilter(arr) {
            var unique_array = arr.filter(function(elem, index, self) {
                return index == self.indexOf(elem);
            });
            return unique_array
        }
        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };
    });