/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */
define(['N/file', 'N/search', 'N/format', 'N/record', 'N/task'], function(file, search, format, record, task) {

    function getInputData() {
        try {
            log.debug('Hello');
            return itemSearch = search.create({
                type: "item",
                filters: [
                   ['type', 'anyof', "InvtPart"]
                ],
                columns: [
                    search.createColumn({
                        name: "internalid"
                    })

                ]
            });

        } catch (ex) {
            log.error(ex.name, ex.message);
        }

    }


    function map(context) {

        try {
            var itemSearch1 = JSON.parse(context.value);
            var itemId = itemSearch1.id;
             log.debug('itemId', itemId);
            context.write({
                value: itemId
            });
        } catch (ex) {
            log.error(ex.name, ex.message);
        }

    }


    function reduce(context) {

        try {
            var id = JSON.parse(context.key);
            var itemId = id.value;
            //log.debug('itemId', itemId);
            var transactionSearch = search.create({
                type: 'purchaseorder',

                filters: [
                    ['item', 'anyof', itemId]
                ],
                columns: [
                {
                        name: "item"
                    },
                        {
                        name: "trandate",
                        sort: search.Sort.DESC
                    },
                    {
                        name: "totalvalue",
                        join: "item"

                    },
                    {
                        name: "class",
                        join: "item"

                    },
                    {
                        name: "totalquantityonhand",
                        join: "item"

                    }
                ]

            });
           var count = transactionSearch.runPaged().count;
            log.debug('count', count);
            var date;
            var amount;
            var item;
            var itemText;
            var itemclass;
            var onHand;
            transactionSearch.run().each(function(result) {
                 item = result.getValue({
                    name: 'item'
                });
                 itemText = result.getText({
                    name: 'item'
                });
                date = result.getValue({
                    name: 'trandate',
                    sort: search.Sort.DESC
                });
                amount = result.getValue({
                    name: 'totalvalue',
                    join: "item"
                });
                itemClass=result.getValue({
                    name: 'class',
                    join: "item"
                });
                onHand=result.getValue({
                    name: 'totalquantityonhand',
                    join: "item"
                });
            
            });
            log.debug('date', date);
            log.debug('amount', amount);
            log.debug('item', item);
            log.debug('itemText', itemText);
            log.debug('onHand', onHand);
            if(date)
            {
            var date1 = format.parse({
                value: date,
                type: format.Type.DATE
            });
            currentDate = new Date();
            var monthDiff = (currentDate.getTime() - date1.getTime()) / 1000;
            monthDiff /= (60 * 60 * 24 * 7 * 4);
            var monthDiff1 = Math.floor(monthDiff);
            monthDiff1 = monthDiff1.toFixed(0);
            log.debug('monthDiff1', monthDiff1);
            var year = new Date().getFullYear();
            log.debug('year', year);
            var month = new Date().getMonth();
            log.debug('month', month);
            var periodId = getId(month, year);
            log.debug('periodId', periodId);

            var itemReceiptSearch = search.create({
                type: 'transaction',
                filters: [
                    ['type', 'anyof', 'ItemRcpt'], "AND", ['postingperiod', 'anyof', periodId], "AND", ['item', 'anyof', item], "AND", ['taxline', 'is', false], "AND", ['mainline', 'is', false]
                ],
                columns: [
                    search.createColumn({
                        name: "internalid",
                        summary: search.Summary.GROUP
                    }),
                    search.createColumn({
                        name: "formulanumeric0_12",
                        formula: "CASE WHEN TRUNC ({today})-{trandate} BETWEEN 1 AND 365 THEN {quantity} END/2",
                        summary: search.Summary.MAX
                    }),
                    search.createColumn({
                        name: "formulanumericvalue_0_12",
                        formula: "SUM(CASE WHEN TRUNC ({today})-{trandate} BETWEEN 1 AND 365 THEN ({rate}*{quantity})/2 END)+SUM((CASE WHEN TRUNC ({today})-{trandate} BETWEEN 1 AND 365 THEN (CASE WHEN ({memo} LIKE '%Customs%') THEN {creditamount} else 0 END+CASE WHEN ({memo} LIKE '%Freight%') AND ({item} = {item.name}) THEN {creditamount} else 0 END+CASE WHEN ({memo} LIKE '%Shipping & Handling%') AND ({item} = {item.name}) THEN {creditamount} else 0 END+CASE WHEN ({memo} LIKE '%Air Fare%') THEN {creditamount} else 0 END) END)/2)",
                        summary: search.Summary.SUM
                    }),
                    search.createColumn({
                        name: "formulanumeric13_24",
                        formula: "CASE WHEN TRUNC ({today})-{trandate} BETWEEN 366 AND 731 THEN {quantity} END",
                        summary: search.Summary.MAX
                    }),
                    search.createColumn({
                        name: "formulanumericvalue_13_24",
                        formula: "MAX(CASE WHEN TRUNC ({today})-{trandate} BETWEEN 366 AND 731 THEN ({rate}*{quantity}) END)+SUM((CASE WHEN TRUNC ({today})-{trandate} BETWEEN 366 AND 731 THEN (CASE WHEN ({memo} LIKE '%Customs%') THEN {creditamount} else 0 END+CASE WHEN ({memo} LIKE '%Freight%') AND ({item} = {item.name}) THEN {creditamount} else 0 END+CASE WHEN ({memo} LIKE '%Shipping & Handling%') AND ({item} = {item.name}) THEN {creditamount} else 0 END+CASE WHEN ({memo} LIKE '%Air Fare%') THEN {creditamount} else 0 END) END)/2)",
                        summary: search.Summary.SUM
                    }),
                    search.createColumn({
                        name: "formulanumeric25_36",
                        formula: "CASE WHEN TRUNC ({today})-{trandate} BETWEEN 732 AND 1095 THEN {quantity} END",
                        summary: search.Summary.MAX
                    }),
                    search.createColumn({
                        name: "formulanumericvalue_25_36",
                        formula: "MAX(CASE WHEN TRUNC ({today})-{trandate} BETWEEN 732 AND 1095 THEN {amount} END)+SUM((CASE WHEN TRUNC ({today})-{trandate} BETWEEN 732 AND 1095 THEN (CASE WHEN ({memo} LIKE '%Customs%') THEN {creditamount} else 0 END+CASE WHEN ({memo} LIKE '%Freight%') AND ({item} = {item.name}) THEN {creditamount} else 0 END+CASE WHEN ({memo} LIKE '%Shipping & Handling%') AND ({item} = {item.name}) THEN {creditamount} else 0 END+CASE WHEN ({memo} LIKE '%Air Fare%') THEN {creditamount} else 0 END) END)/2)",
                        summary: search.Summary.SUM
                    }),
                    search.createColumn({
                        name: "formulanumeric37_48",
                        formula: "CASE WHEN TRUNC ({today})-{trandate} BETWEEN 1096 AND 1366 THEN {quantity} END",
                        summary: search.Summary.MAX
                    }),
                    search.createColumn({
                        name: "formulanumericvalue_37_48",
                        formula: "MAX(CASE WHEN TRUNC ({today})-{trandate} BETWEEN 1096 AND 1366 THEN ({rate}*{quantity}) END)+SUM((CASE WHEN TRUNC ({today})-{trandate} BETWEEN 1096 AND 1366 THEN (CASE WHEN ({memo} LIKE '%Customs%') THEN {creditamount} else 0 END+CASE WHEN ({memo} LIKE '%Freight%') AND ({item} = {item.name}) THEN {creditamount} else 0 END+CASE WHEN ({memo} LIKE '%Shipping & Handling%') AND ({item} = {item.name}) THEN {creditamount} else 0 END+CASE WHEN ({memo} LIKE '%Air Fare%') THEN {creditamount} else 0 END) END)/2)",
                        summary: search.Summary.SUM
                    }),
                    search.createColumn({
                        name: "formulanumeric49_60",
                        formula: "CASE WHEN TRUNC ({today})-{trandate} BETWEEN 1367 AND 1825 THEN {quantity} END",
                        summary: search.Summary.MAX
                    }),
                    search.createColumn({
                        name: "formulanumericvalue_49_60",
                        formula: "MAX(CASE WHEN TRUNC ({today})-{trandate} BETWEEN 1367 AND 1825 THEN ({rate}*{quantity}) END)+SUM((CASE WHEN TRUNC ({today})-{trandate} BETWEEN 1367 AND 1825 THEN (CASE WHEN ({memo} LIKE '%Customs%') THEN {creditamount} else 0 END+CASE WHEN ({memo} LIKE '%Freight%') AND ({item} = {item.name}) THEN {creditamount} else 0 END+CASE WHEN ({memo} LIKE '%Shipping & Handling%') AND ({item} = {item.name}) THEN {creditamount} else 0 END+CASE WHEN ({memo} LIKE '%Air Fare%') THEN {creditamount} else 0 END) END)/2)",
                        summary: search.Summary.SUM
                    }),
                    search.createColumn({
                        name: "formulanumeric61_72",
                        formula: "CASE WHEN TRUNC ({today})-{trandate} BETWEEN 1826 AND 2190 THEN {quantity} END",
                        summary: search.Summary.MAX
                    }),
                    search.createColumn({
                        name: "formulanumericvalue_61_72",
                        formula: "MAX(CASE WHEN TRUNC ({today})-{trandate} BETWEEN 1826 AND 2190 THEN ({rate}*{quantity}) END)+SUM((CASE WHEN TRUNC ({today})-{trandate} BETWEEN 1826 AND 2190 THEN (CASE WHEN ({memo} LIKE '%Customs%') THEN {creditamount} else 0 END+CASE WHEN ({memo} LIKE '%Freight%') AND ({item} = {item.name}) THEN {creditamount} else 0 END+CASE WHEN ({memo} LIKE '%Shipping & Handling%') AND ({item} = {item.name}) THEN {creditamount} else 0 END+CASE WHEN ({memo} LIKE '%Air Fare%') THEN {creditamount} else 0 END) END)/2)",
                        summary: search.Summary.SUM
                    }),
                    search.createColumn({
                        name: "formulanumeric73_84",
                        formula: "CASE WHEN TRUNC ({today})-{trandate} BETWEEN 2191 AND 2555 THEN {quantity} END",
                        summary: search.Summary.MAX
                    }),
                    search.createColumn({
                        name: "formulanumericvalue_73_84",
                        formula: "MAX(CASE WHEN TRUNC ({today})-{trandate} BETWEEN 2191 AND 2555 THEN ({rate}*{quantity}) END)+SUM((CASE WHEN TRUNC ({today})-{trandate} BETWEEN 2191 AND 2555 THEN (CASE WHEN ({memo} LIKE '%Customs%') THEN {creditamount} else 0 END+CASE WHEN ({memo} LIKE '%Freight%') AND ({item} = {item.name}) THEN {creditamount} else 0 END+CASE WHEN ({memo} LIKE '%Shipping & Handling%') AND ({item} = {item.name}) THEN {creditamount} else 0 END+CASE WHEN ({memo} LIKE '%Air Fare%') THEN {creditamount} else 0 END) END)/2)",
                        summary: search.Summary.SUM
                    }),
                    search.createColumn({
                        name: "formulanumeric85_96",
                        formula: "CASE WHEN TRUNC ({today})-{trandate} BETWEEN 2556 AND 2919 THEN {quantity} END",
                        summary: search.Summary.MAX
                    }),
                    search.createColumn({
                        name: "formulanumericvalue_85_96",
                        formula: "MAX(CASE WHEN TRUNC ({today})-{trandate} BETWEEN 2556 AND 2919 THEN ({rate}*{quantity}) END)+SUM((CASE WHEN TRUNC ({today})-{trandate} BETWEEN 2556 AND 2919 THEN (CASE WHEN ({memo} LIKE '%Customs%') THEN {creditamount} else 0 END+CASE WHEN ({memo} LIKE '%Freight%') AND ({item} = {item.name}) THEN {creditamount} else 0 END+CASE WHEN ({memo} LIKE '%Shipping & Handling%') AND ({item} = {item.name}) THEN {creditamount} else 0 END+CASE WHEN ({memo} LIKE '%Air Fare%') THEN {creditamount} else 0 END) END)/2)",
                        summary: search.Summary.SUM
                    })
                ]
            });
            var itemReceiptSearchCount = itemReceiptSearch.runPaged().count;
                log.debug('itemReceiptSearchCount', itemReceiptSearchCount);
                var quantity_0_12;
                var value_0_12;
                var quantity_13_24;
                var value_13_24;
                var quantity_25_36;
                var value_25_36;
                var quantity_37_48;
                var value_37_48;
                var quantity_49_60;
                var value_49_60;
                var quantity_61_72;
                var value_61_72;
                var quantity_73_84;
                var value_73_84;
                var quantity_85_96;
                var value_85_96;
                itemReceiptSearch.run().each(function(result) {
                    var internalId = result.getValue({
                        name: "internalid",
                        summary: search.Summary.GROUP
                    });
                    log.debug('internalId',internalId);
                    quantity_0_12 = result.getValue({
                        name: "formulanumeric0_12",
                        summary: search.Summary.MAX
                    });
                    log.debug('quantity_0_12', quantity_0_12);
                    value_0_12 = result.getValue({
                        name: "formulanumericvalue_0_12",
                        summary: search.Summary.SUM
                    });
                    log.debug('value_0_12', value_0_12);
                    quantity_13_24 = result.getValue({
                        name: "formulanumeric13_24",
                        summary: search.Summary.MAX
                    });
                    log.debug('quantity_13_24', quantity_13_24);
                    value_13_24 = result.getValue({
                        name: "formulanumericvalue_13_24",
                        summary: search.Summary.SUM
                    });
                    log.debug('value_13_24', value_13_24);
                    quantity_25_36 = result.getValue({
                        name: "formulanumeric25_36",
                        summary: search.Summary.MAX
                    });
                    log.debug('quantity_25_36', quantity_25_36);
                    value_25_36 = result.getValue({
                        name: "formulanumericvalue_25_36",
                        summary: search.Summary.SUM
                    });
                    log.debug('value_25_36', value_25_36);
                    quantity_37_48 = result.getValue({
                        name: "formulanumeric37_48",
                        summary: search.Summary.MAX
                    });
                    log.debug('quantity_37_48', quantity_37_48);
                    value_37_48 = result.getValue({
                        name: "formulanumericvalue_37_48",
                        summary: search.Summary.SUM
                    });
                    log.debug('value_37_48', value_37_48);
                    quantity_49_60 = result.getValue({
                        name: "formulanumeric49_60",
                        summary: search.Summary.MAX
                    });
                    log.debug('quantity_49_60', quantity_49_60);
                    value_49_60 = result.getValue({
                        name: "formulanumericvalue_49_60",
                        summary: search.Summary.SUM
                    });
                    log.debug('value_49_60', value_49_60);
                    quantity_61_72 = result.getValue({
                        name: "formulanumeric61_72",
                        summary: search.Summary.MAX
                    });
                    log.debug('quantity_61_72', quantity_61_72);
                    value_61_72 = result.getValue({
                        name: "formulanumericvalue_61_72",
                        summary: search.Summary.SUM
                    });
                    log.debug('value_61_72', value_61_72);
                    quantity_73_84 = result.getValue({
                        name: "formulanumeric73_84",
                        summary: search.Summary.MAX
                    });
                    log.debug('quantity_73_84', quantity_73_84);
                    value_73_84 = result.getValue({
                        name: "formulanumericvalue_73_84",
                        summary: search.Summary.SUM
                    });
                    log.debug('value_73_84', value_73_84);
                    quantity_85_96 = result.getValue({
                        name: "formulanumeric85_96",
                        summary: search.Summary.MAX
                    });
                    log.debug('quantity_85_96', quantity_85_96);
                    value_85_96 = result.getValue({
                        name: "formulanumericvalue_85_96",
                        summary: search.Summary.SUM
                    });
                    log.debug('value_85_96', value_85_96);
                    return true;
                });
           var inventoryAgingRec = record.create({
                type: 'customrecord_da_inventory_ageing_record'
            });
            log.debug('inventoryAgingRec',inventoryAgingRec);
            //inventoryAgingRec.setValue('custrecord_da_invenotry_aging_subsidiary',subsidiary);
            inventoryAgingRec.setValue('custrecord_da_invenotry_aging_item_categ', itemClass);
            inventoryAgingRec.setValue('custrecord_da_inventory_aging_period', periodId);
            inventoryAgingRec.setValue('custrecord_da_inventory_aging_item', item);
            if(monthDiff1 < 12)
            {
                inventoryAgingRec.setValue('custrecord_da_invt_less_12_buck_qty',quantity_0_12);
                inventoryAgingRec.setValue('custrecord_da_invt_less_12_buck_amt', value_0_12);
            }
            else if(monthDiff1 > 12 && monthDiff1 < 25)
            {
                inventoryAgingRec.setValue('custrecord_da_invt_13_24_buck_qty',quantity_13_24);
                inventoryAgingRec.setValue('custrecord_da_invt_13_24_buck_amt', value_13_24);
            }
            else if(monthDiff1 > 24 && monthDiff1 < 37)
            {
                inventoryAgingRec.setValue('custrecord_da_invt_25_36_buck_qty',quantity_25_36);
                inventoryAgingRec.setValue('custrecord_da_invt_25_36_buck_amt', value_25_36);
            }
            else if(monthDiff1 > 36 && monthDiff1 < 49)
            {
                inventoryAgingRec.setValue('custrecord_da_invt_37_48_buck_qty',quantity_37_48);
                inventoryAgingRec.setValue('custrecord_da_invt_37_48_buck_amt', value_37_48);
            }
            else if(monthDiff1 > 48 && monthDiff1 < 61)
            {
                inventoryAgingRec.setValue('custrecord_da_invt_48_60_buck_qty',quantity_49_60);
                inventoryAgingRec.setValue('custrecord_da_invt_48_60_buck_amt', value_49_60);
            }
            else if(monthDiff1 > 60 && monthDiff1 < 73)
            {
                inventoryAgingRec.setValue('custrecord_da_invt_61_72_buck_qty',quantity_61_72);
                inventoryAgingRec.setValue('custrecord_da_invt_61_72_buck_amt', value_61_72);
            }
            else if(monthDiff1 > 72 && monthDiff1 < 85)
            {
                inventoryAgingRec.setValue('custrecord_da_invt_72_85_buck_qty',quantity_73_84);
                inventoryAgingRec.setValue('custrecord_da_invt_72_85_buck_amt', value_73_84);
            }
            else
            {
                inventoryAgingRec.setValue('custrecord_da_invt_85_96_buck_qty',quantity_85_96);
                inventoryAgingRec.setValue('custrecord_da_invt_85_96_buck_amt', value_85_96);
            }

            /*inventoryAgingRec.setValue('custrecord_da_current_month_qty', quantity);
            var currentMonthVal = 0;
            currentMonthVal = parseFloat(currentMonthVal) + (parseFloat(quantity) * parseFloat(avgCost));
            log.debug('currentMonthVal',currentMonthVal);
            inventoryAgingRec.setValue('custrecordcurrent_month_value',  currentMonthVal.toFixed(3));*/
            var inventoryAgingRecId = inventoryAgingRec.save();
            log.debug('inventoryAgingRecId', inventoryAgingRecId);
        }

        } catch (e) {
            log.error(e.name, e.message);
        }
    }


    function summarize(context) {


    }
    function getId(month, year) {
        var monthObj = {
            00: 'Jan',
            01: 'Feb',
            02: 'Mar',
            03: 'Apr',
            04: 'May',
            05: 'Jun',
            06: 'July',
            07: 'Aug',
            08: 'Sep',
            09: 'Oct',
            10: 'Nov',
            11: 'Dec'
        };

        var monthId = monthObj[month];

        var year;
        var sample = search.create({
            type: search.Type.ACCOUNTING_PERIOD,
            filters: [
                ['periodname', 'is', monthId + ' ' + year]
            ]

        });

        var id;
        sample.run().each(function(result) {
            id = result.id;
            return true;
        });

        return id;
    }




    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
});