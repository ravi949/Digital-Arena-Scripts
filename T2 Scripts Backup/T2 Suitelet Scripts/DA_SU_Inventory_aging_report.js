/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(['N/ui/serverWidget', 'N/search', 'N/format', 'N/encode', 'N/file', 'N/record', 'N/redirect', 'N/url'],
    function(ui, search, format, encode, file, record, redirect, url) {
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
                    var form = ui.createForm({
                        title: 'Inventory Aging Report'
                    });
                    var tab = form.addSubtab({
                        id: 'custpage_tab',
                        label: 'Report'
                    });
                    var postingPeriodField = form.addField({
                        id: 'custpage_posting_period',
                        type: ui.FieldType.SELECT,
                        label: 'As Of postingPeriod',
                        source: 'accountingperiod',
                        container: 'custpage_tab'
                    });
                    var itemCategeoryField = form.addField({
                        id: 'custpage_item_categeory',
                        type: ui.FieldType.SELECT,
                        label: 'Item Category',
                        source: 'classification',
                        container: 'custpage_tab'
                    });
                    var reportList = form.addSublist({
                        id: 'custpage_report_sublist',
                        type: ui.SublistType.LIST,
                        label: 'Report',
                        tab: 'custpage_tab'
                    });
                    var cost = reportList.addField({
                        id: 'custpage_cost',
                        type: ui.FieldType.CURRENCY,
                        label: 'Cost'
                    });
                    cost.updateDisplaySize({
                        height: 60,
                        width: 50
                    });
                    reportList.addField({
                        id: 'custpage_bracket',
                        type: ui.FieldType.TEXT,
                        label: 'Bracket'
                    });
                    reportList.addField({
                        id: 'custpage_percentage',
                        type: ui.FieldType.PERCENT,
                        label: '%'
                    });
                    reportList.addField({
                        id: 'custpage_provision',
                        type: ui.FieldType.FLOAT,
                        label: 'Provision'
                    });

                    if (request.parameters.postingPeriod) {
                        var postingPeriodValue = request.parameters.postingPeriod;
                        log.debug('postingPeriodValue', postingPeriodValue);
                        form.addSubmitButton({
                            label: 'Submit'
                        });
                        postingPeriodField.defaultValue = postingPeriodValue;
                        var inventorySettingRec = record.load({
                            type: 'customrecord_da_invent_aging_provision',
                            id: 1
                        });
                        var percentage1 = inventorySettingRec.getValue('custrecord_da_bucket_0_12');
                        var percentage2 = inventorySettingRec.getValue('custrecord_da_bucket_13_24');
                        var percentage3 = inventorySettingRec.getValue('custrecord_da_bucket_25_36');
                        log.debug('percentage3', percentage3);
                        var percentage4 = inventorySettingRec.getValue('custrecord_da_bucket_37_48');
                        var percentage5 = inventorySettingRec.getValue('custrecord_da_bucket_49_60');
                        var percentage6 = inventorySettingRec.getValue('custrecord_da_bucket_61_72');
                        var percentage7 = inventorySettingRec.getValue('custrecord_da_bucket_73_84');
                        var percentage8 = inventorySettingRec.getValue('custrecord_da_bucket_85_96');
                        var inventoryAgingSearch = search.create({
                            type: 'customrecord_da_inventory_ageing_record',

                            filters: [
                                ['custrecord_da_inventory_aging_period', 'anyof', postingPeriodValue]
                            ],
                            columns: [{
                                    name: "custrecord_da_invt_less_12_buck_amt",
                                    summary: search.Summary.SUM
                                },
                                {
                                    name: "custrecord_da_invt_13_24_buck_amt",
                                    summary: search.Summary.SUM
                                },
                                {
                                    name: "custrecord_da_invt_25_36_buck_amt",
                                    summary: search.Summary.SUM
                                },
                                {
                                    name: "custrecord_da_invt_37_48_buck_amt",
                                    summary: search.Summary.SUM
                                },
                                {
                                    name: "custrecord_da_invt_48_60_buck_amt",
                                    summary: search.Summary.SUM
                                },
                                {
                                    name: "custrecord_da_invt_61_72_buck_amt",
                                    summary: search.Summary.SUM
                                },
                                {
                                    name: "custrecord_da_invt_73_84_buck_amt",
                                    summary: search.Summary.SUM
                                },
                                {
                                    name: "custrecord_da_invt_85_96_buck_amt",
                                    summary: search.Summary.SUM
                                },
                            ]

                        });
                        if (request.parameters.itemCategeoryField) {
                            var itemCategeoryFieldVal = request.parameters.itemCategeoryField;
                            log.debug('itemCategeoryFieldVal', itemCategeoryFieldVal);
                            itemCategeoryField.defaultValue = itemCategeoryFieldVal;
                            inventoryAgingSearch.filters.push(search.createFilter({
                                name: 'custrecord_da_invenotry_aging_item_categ',
                                operator: 'anyof',
                                values: itemCategeoryFieldVal
                            }));
                        }
                        var count = inventoryAgingSearch.runPaged().count;
                        log.debug('count', count);
                        var amount = 0;
                        var amount1 = 0;
                        var amount2 = 0;
                        var amount3 = 0;
                        var amount4 = 0;
                        var amount5 = 0;
                        var amount6 = 0;
                        var amount7 = 0;

                        inventoryAgingSearch.run().each(function(result) {
                            amount = parseFloat(amount) + result.getValue({
                                name: "custrecord_da_invt_less_12_buck_amt",
                                summary: search.Summary.SUM
                            });
                            amount = Number(amount).toFixed(2);
                            amount1 = parseFloat(amount1) + result.getValue({
                                name: "custrecord_da_invt_13_24_buck_amt",
                                summary: search.Summary.SUM
                            });
                            amount1 = Number(amount1).toFixed(2);
                            amount2 = parseFloat(amount2) + result.getValue({
                                name: "custrecord_da_invt_25_36_buck_amt",
                                summary: search.Summary.SUM
                            });
                            amount2 = Number(amount2).toFixed(2);
                            amount3 = parseFloat(amount3) + result.getValue({
                                name: "custrecord_da_invt_37_48_buck_amt",
                                summary: search.Summary.SUM
                            });
                            amount3 = Number(amount3).toFixed(2);
                            amount4 = parseFloat(amount4) + result.getValue({
                                name: "custrecord_da_invt_48_60_buck_amt",
                                summary: search.Summary.SUM
                            });
                            amount4 = Number(amount4).toFixed(2);
                            amount5 = parseFloat(amount5) + result.getValue({
                                name: "custrecord_da_invt_61_72_buck_amt",
                                summary: search.Summary.SUM
                            });
                            amount5 = Number(amount5).toFixed(2);
                            amount6 = parseFloat(amount6) + result.getValue({
                                name: "custrecord_da_invt_73_84_buck_amt",
                                summary: search.Summary.SUM
                            });
                            amount6 = Number(amount6).toFixed(2);
                            amount7 = parseFloat(amount7) + result.getValue({
                                name: "custrecord_da_invt_85_96_buck_amt",
                                summary: search.Summary.SUM
                            });
                            amount7 = Number(amount7).toFixed(2);
                            log.debug('amount', amount);
                            log.debug('amount1', amount1);
                            reportList.setSublistValue({
                                id: 'custpage_bracket',
                                line: 0,
                                value: "0<12 months"
                            });
                            reportList.setSublistValue({
                                id: 'custpage_cost',
                                line: 0,
                                value: amount
                            });

                            reportList.setSublistValue({
                                id: 'custpage_percentage',
                                line: 0,
                                value: percentage1
                            });
                            var proivision1 = (parseFloat(amount) * parseFloat(percentage1)) / 100;
                            reportList.setSublistValue({
                                id: 'custpage_provision',
                                line: 0,
                                value: proivision1
                            });
                            log.debug('proivision1', proivision1);
                            reportList.setSublistValue({
                                id: 'custpage_bracket',
                                line: 1,
                                value: "13-24 months"
                            });

                            reportList.setSublistValue({
                                id: 'custpage_cost',
                                line: 1,
                                value: amount1
                            });
                            reportList.setSublistValue({
                                id: 'custpage_percentage',
                                line: 1,
                                value: percentage2
                            });
                            var proivision2 = (parseFloat(amount1) * parseFloat(percentage2)) / 100;
                            reportList.setSublistValue({
                                id: 'custpage_provision',
                                line: 1,
                                value: proivision2
                            });
                            reportList.setSublistValue({
                                id: 'custpage_bracket',
                                line: 2,
                                value: "25-36 months"
                            });
                            reportList.setSublistValue({
                                id: 'custpage_cost',
                                line: 2,
                                value: amount2
                            });
                            reportList.setSublistValue({
                                id: 'custpage_percentage',
                                line: 2,
                                value: percentage3
                            });
                            var proivision3 = (parseFloat(amount2) * parseFloat(percentage3)) / 100;
                            reportList.setSublistValue({
                                id: 'custpage_provision',
                                line: 2,
                                value: proivision3
                            });
                            reportList.setSublistValue({
                                id: 'custpage_bracket',
                                line: 3,
                                value: "37-48 months"
                            });
                            reportList.setSublistValue({
                                id: 'custpage_cost',
                                line: 3,
                                value: amount3
                            });
                            reportList.setSublistValue({
                                id: 'custpage_percentage',
                                line: 3,
                                value: percentage4
                            });
                            var proivision3 = (parseFloat(amount3) * parseFloat(percentage4)) / 100;
                            reportList.setSublistValue({
                                id: 'custpage_provision',
                                line: 3,
                                value: proivision3
                            });
                            reportList.setSublistValue({
                                id: 'custpage_bracket',
                                line: 4,
                                value: "49-60 months"
                            });
                            reportList.setSublistValue({
                                id: 'custpage_cost',
                                line: 4,
                                value: amount4
                            });
                            log.debug('percentage5', percentage5);
                            reportList.setSublistValue({
                                id: 'custpage_percentage',
                                line: 4,
                                value: percentage5
                            });
                            var proivision4 = (parseFloat(amount4) * parseFloat(percentage5)) / 100;
                            log.debug('proivision4', proivision4);
                            reportList.setSublistValue({
                                id: 'custpage_provision',
                                line: 4,
                                value: proivision4
                            });
                            reportList.setSublistValue({
                                id: 'custpage_bracket',
                                line: 5,
                                value: "61-72 months"
                            });
                            reportList.setSublistValue({
                                id: 'custpage_cost',
                                line: 5,
                                value: amount5
                            });
                            reportList.setSublistValue({
                                id: 'custpage_percentage',
                                line: 5,
                                value: percentage6
                            });
                            var proivision5 = (parseFloat(amount5) * parseFloat(percentage6)) / 100;
                            reportList.setSublistValue({
                                id: 'custpage_provision',
                                line: 5,
                                value: proivision5
                            });
                            reportList.setSublistValue({
                                id: 'custpage_bracket',
                                line: 6,
                                value: "73-84 months"
                            });
                            reportList.setSublistValue({
                                id: 'custpage_cost',
                                line: 6,
                                value: amount6
                            });
                            reportList.setSublistValue({
                                id: 'custpage_percentage',
                                line: 6,
                                value: percentage7
                            });
                            var proivision6 = (parseFloat(amount7) * parseFloat(percentage7)) / 100;
                            reportList.setSublistValue({
                                id: 'custpage_provision',
                                line: 6,
                                value: proivision6
                            });
                            reportList.setSublistValue({
                                id: 'custpage_bracket',
                                line: 7,
                                value: "85-96 months"
                            });
                            reportList.setSublistValue({
                                id: 'custpage_cost',
                                line: 7,
                                value: amount7
                            });
                            reportList.setSublistValue({
                                id: 'custpage_percentage',
                                line: 7,
                                value: percentage8
                            });
                            var proivision7 = (parseFloat(amount7) * parseFloat(percentage8)) / 100;
                            reportList.setSublistValue({
                                id: 'custpage_provision',
                                line: 7,
                                value: proivision7
                            });

                            return true;
                        });
                    }
                    context.response.writePage(form);
                    form.clientScriptModulePath = './DA_CS_Inventory_Aging_report.js ';
                } else {
                    log.debug('else');
                    var postingPeriodId = request.parameters.custpage_posting_period;
                    log.debug('postingPeriodId', postingPeriodId);
                    var itemCategeoryId = request.parameters.custpage_item_categeory;
                    log.debug('itemCategeoryId', itemCategeoryId);
                    var invSettingRec = record.load({
                        type: 'customrecord_da_invent_aging_provision',
                        id: 1
                    });
                    var subsidiaryId = invSettingRec.getValue('custrecord_da_invent_aging_subsidiary');
                    log.debug('subsidiaryId', subsidiaryId);
                    var creditAccount = invSettingRec.getValue('custrecord_da_invent_provision_acco');
                    log.debug('creditAccount', creditAccount);
                    var debitAccount = invSettingRec.getValue('custrecord_da_invent_provision_expense');
                    log.debug('debitAccount', debitAccount);
                    var numLines = request.getLineCount({
                        group: 'custpage_report_sublist'
                    });
                    for (var i = 0; i < numLines; i++) {
                        var provisionAmount = request.getSublistValue({
                            group: 'custpage_report_sublist',
                            name: 'custpage_provision',
                            line: i
                        });
                        log.debug('provisionAmount', provisionAmount);
                        if (provisionAmount > 0) {
                            var invProvisionRec = record.create({
                                type: 'customtransaction_da_iventory_aging_prov',
                                isDynamic: true
                            });
                            invProvisionRec.setValue('subsidiary', subsidiaryId);
                            invProvisionRec.setValue('postingperiod', postingPeriodId);

                            invProvisionRec.selectNewLine({
                                sublistId: 'line'
                            });
                            invProvisionRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'account',
                                value: creditAccount
                            });
                            invProvisionRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'credit',
                                value: Number(provisionAmount).toFixed(2)
                            });
                            invProvisionRec.commitLine({
                                sublistId: 'line'
                            });

                            invProvisionRec.selectNewLine({
                                sublistId: 'line'
                            });
                            invProvisionRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'account',
                                value: debitAccount
                            });
                            invProvisionRec.setCurrentSublistValue({
                                sublistId: 'line',
                                fieldId: 'debit',
                                value: Number(provisionAmount).toFixed(2)
                            });
                            invProvisionRec.commitLine({
                                sublistId: 'line'
                            });
                            var invProvisionRecord = invProvisionRec.save();
                            log.debug('invProvisionRecord', invProvisionRecord);

                        var inventoryAgingSearch = search.create({
                            type: 'customrecord_da_inventory_ageing_record',

                            filters: [
                                ['custrecord_da_inventory_aging_period', 'anyof', postingPeriodId]
                            ],
                            columns: [
                            'custrecord_da_inventory_aging_item'
                            ]
                        });
                        if (itemCategeoryId) {
                            inventoryAgingSearch.filters.push(search.createFilter({
                                name: 'custrecord_da_invenotry_aging_item_categ',
                                operator: 'anyof',
                                values: itemCategeoryId
                            }));
                        }
                        if (i == 0) {
                            inventoryAgingSearch.filters.push(search.createFilter({
                                name: 'custrecord_da_invt_less_12_buck_qty',
                                operator: 'ISNOTEMPTY'
                            }));
                        }
                        if (i == 1) {
                            inventoryAgingSearch.filters.push(search.createFilter({
                                name: 'custrecord_da_invt_13_24_buck_qty',
                                operator: 'ISNOTEMPTY'
                            }));
                        }
                        if (i == 2) {
                            inventoryAgingSearch.filters.push(search.createFilter({
                                name: 'custrecord_da_invt_25_36_buck_qty',
                                operator: 'ISNOTEMPTY'
                            }));
                        }
                        if (i == 3) {
                            inventoryAgingSearch.filters.push(search.createFilter({
                                name: 'custrecord_da_invt_37_48_buck_qty',
                                operator: 'ISNOTEMPTY'
                            }));
                        }
                        if (i == 4) {
                            inventoryAgingSearch.filters.push(search.createFilter({
                                name: 'custrecord_da_invt_48_60_buck_qty',
                                operator: 'ISNOTEMPTY'
                            }));
                        }
                        if (i == 5) {
                            inventoryAgingSearch.filters.push(search.createFilter({
                                name: 'custrecord_da_invt_61_72_buck_qty',
                                operator: 'ISNOTEMPTY'
                            }));
                        }
                        if (i == 6) {
                            inventoryAgingSearch.filters.push(search.createFilter({
                                name: 'custrecord_da_invt_73_84_buck_qty',
                                operator: 'ISNOTEMPTY'
                            }));
                        }
                        if (i == 7) {
                            inventoryAgingSearch.filters.push(search.createFilter({
                                name: 'custrecord_da_invt_85_96_buck_qty',
                                operator: 'ISNOTEMPTY'
                            }));
                        }
                        var count = inventoryAgingSearch.runPaged().count;
                        log.debug('count', count);
                        inventoryAgingSearch.run().each(function(result) {
                            var itemId = result.getValue('custrecord_da_inventory_aging_item');
                            log.debug('itemId',itemId);

                            var invAgingItemProvRec = record.create({
                                type: 'customrecord_da_inventory_item_provision',
                                isDynamic: true
                            });
                            invAgingItemProvRec.setValue('custrecord_da_invenotry_prov_item', itemId);
                            invAgingItemProvRec.setValue('custrecord_da_inventory_prov_amount', provisionAmount);
                            invAgingItemProvRec.setValue('custrecord_da_inventory_prov_ref', invProvisionRecord);
                            var invAgingItemProvRecId = invAgingItemProvRec.save();
                            log.debug('invAgingItemProvRecId',invAgingItemProvRecId);
                            return true;
                        });

                        }
                        var output1 = url.resolveScript({
                            scriptId: 'customscript_da_su_inventory_aging_reprt',
                            deploymentId: 'customdeploy_da_su_inventory_aging_reprt',
                            returnExternalUrl: false
                        });
                        log.debug('output1', output1);
                        redirect.redirect({
                            url: output1
                        });
                    }
                }

            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }

        function contains(arr, element) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] === element) {
                    return true;
                }
            }
            return false;
        }


        return {
            onRequest: onRequest
        };
    });