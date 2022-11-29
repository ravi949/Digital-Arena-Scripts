/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope TargetAccount
 */
define(['N/ui/serverWidget', 'N/search', 'N/format', 'N/encode', 'N/file', 'N/record'],
    function(ui, search, format, encode, file, record) {
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
                    var itemCategoryField = form.addField({
                        id: 'custpage_item_category',
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
                    var itemField = reportList.addField({
                        id: 'custpage_item',
                        type: ui.FieldType.TEXT,
                        label: 'Item'
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
                    if (request.parameters.itemCategory) {
                        var itemCategoryValue = request.parameters.itemCategory;
                        log.debug('itemCategoryValue', itemCategoryValue);
                        itemCategoryField.defaultValue = itemCategoryValue;
                    }

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
                            columns: [
                                {
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
                                {
                                    name: "custrecord_da_inventory_aging_item",
                                    summary: search.Summary.GROUP
                                }
                            ]

                        });
                        if(itemCategoryValue){
                            var itemCategoryFilters = inventoryAgingSearch.filters;
                            itemCategoryFilters.push(search.createFilter({
                                name: "custrecord_da_invenotry_aging_item_categ",
                                operator: search.Operator.ANYOF,
                                values: itemCategoryValue
                            }));
                        }
                        
                        var count = inventoryAgingSearch.runPaged().count;
                        log.debug('count', count);
                        var itemVal;
                        var amount = 0;
                        var amount1 = 0;
                        var amount2 = 0;
                        var amount3 = 0;
                        var amount4 = 0;
                        var amount5 = 0;
                        var amount6 = 0;
                        var amount7 = 0;
                        inventoryAgingSearch.run().each(function(result) {
                            itemVal = result.getText({
                                name: "custrecord_da_inventory_aging_item",
                                    summary: search.Summary.GROUP
                            });
                            log.debug('itemVal',itemVal);
                            var amount11 = result.getValue({
                                name: "custrecord_da_invt_less_12_buck_amt",
                                summary: search.Summary.SUM
                            });
                            log.debug('amount11',amount11);
                            if(amount11 > 0){
                                amount = parseFloat(amount) + parseFloat(amount11);
                                amount = Number(amount).toFixed(2);
                            } else {
                                amount = Number(amount).toFixed(2);
                            }
                            
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
                            log.debug('amount2', amount2);
                            log.debug('amount3', amount3);
                            log.debug('amount4', amount4);
                            log.debug('amount5', amount5);
                            log.debug('amount6', amount6);
                            log.debug('amount7', amount7);
                            if(itemVal){
                                reportList.setSublistValue({
                                id: 'custpage_item',
                                line: 0,
                                value: itemVal
                            });
                            }
                            
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
                                value: proivision1.toFixed(2)
                            });
                            log.debug('proivision1', proivision1);
                            if(itemVal){
                                reportList.setSublistValue({
                                id: 'custpage_item',
                                line: 1,
                                value: itemVal
                            });
                            }
                            
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
                            log.debug('proivision2', proivision2);
                            reportList.setSublistValue({
                                id: 'custpage_provision',
                                line: 1,
                                value: proivision2.toFixed(2)
                            });
                            if(itemVal){
                                reportList.setSublistValue({
                                id: 'custpage_item',
                                line: 2,
                                value: itemVal
                            });
                            }
                            
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
                            log.debug('proivision3', proivision3);
                            reportList.setSublistValue({
                                id: 'custpage_provision',
                                line: 2,
                                value: proivision3.toFixed(2)
                            });
                            if(itemVal){
                                reportList.setSublistValue({
                                id: 'custpage_item',
                                line: 3,
                                value: itemVal
                            });
                            }
                            
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
                            var proivision4 = (parseFloat(amount3) * parseFloat(percentage4)) / 100;
                            log.debug('proivision4', proivision4);
                            reportList.setSublistValue({
                                id: 'custpage_provision',
                                line: 3,
                                value: proivision4.toFixed(2)
                            });
                            if(itemVal){
                                reportList.setSublistValue({
                                id: 'custpage_item',
                                line: 4,
                                value: itemVal
                            });
                            }
                            
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
                            var proivision5 = (parseFloat(amount4) * parseFloat(percentage5)) / 100;
                            log.debug('proivision5', proivision5);
                            reportList.setSublistValue({
                                id: 'custpage_provision',
                                line: 4,
                                value: proivision5.toFixed(2)
                            });
                            if(itemVal){
                                reportList.setSublistValue({
                                id: 'custpage_item',
                                line: 5,
                                value: itemVal
                            });
                            }
                            
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
                            var proivision6 = (parseFloat(amount5) * parseFloat(percentage6)) / 100;
                            log.debug('proivision6', proivision6);
                            reportList.setSublistValue({
                                id: 'custpage_provision',
                                line: 5,
                                value: proivision6.toFixed(2)
                            });
                            if(itemVal){
                                reportList.setSublistValue({
                                id: 'custpage_item',
                                line: 6,
                                value: itemVal
                            });
                            }
                            
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
                            var proivision7 = (parseFloat(amount7) * parseFloat(percentage7)) / 100;
                            log.debug('proivision7', proivision7);
                            reportList.setSublistValue({
                                id: 'custpage_provision',
                                line: 6,
                                value: proivision7.toFixed(2)
                            });
                            if(itemVal){
                                reportList.setSublistValue({
                                id: 'custpage_item',
                                line: 7,
                                value: itemVal
                            });
                            }
                            
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
                            var proivision8 = (parseFloat(amount7) * parseFloat(percentage8)) / 100;
                            log.debug('proivision8', proivision8);
                            reportList.setSublistValue({
                                id: 'custpage_provision',
                                line: 7,
                                value: proivision8.toFixed(2)
                            });

                            return true;
                        });
                    }

                }
                context.response.writePage(form);
                form.clientScriptModulePath = './DA_CS_Item_Inventory_Aging_Report.js ';
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