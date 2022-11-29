/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/search', 'N/file', 'N/record'],
    function(search, file, record) {
        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @Since 2016.1
         */
        function onAction(scriptContext) {
            try {
              
              var customrecord_da_promotion_coupon_codesSearchObj = search.create({
               type: "customrecord_da_promotion_coupon_codes",
               filters:
               [
                  ["custrecord_da_coupon_code_propmotion","anyof",scriptContext.newRecord.id]
               ],
               columns:
               [
                  search.createColumn({
                     name: "name",
                     sort: search.Sort.ASC,
                     label: "Name"
                  }),
                  search.createColumn({name: "scriptid", label: "Script ID"}),
                  search.createColumn({name: "custrecord_da_coupon_code_propmotion", label: "DA Promotion"})
               ]
            });
            var searchResultCount = customrecord_da_promotion_coupon_codesSearchObj.runPaged().count;
            log.debug("customrecord_da_promotion_coupon_codesSearchObj result count",searchResultCount);
            customrecord_da_promotion_coupon_codesSearchObj.run().each(function(result){
               record.delete({
                 type :'customrecord_da_promotion_coupon_codes',
                 id : result.id
               })
               return true;
            });

                var fileID = scriptContext.newRecord.getValue('custrecord_da_cust_item_promo_import_fil');

                var promitonRec = record.load({
                    type: 'customrecord_da_promotion',
                    id: scriptContext.newRecord.id,
                    isDynamic: true
                });

                var fileObj = file.load({
                    id: fileID
                });

                var csvToJsonArr = fileObj.getContents();

                csvToJsonArr = CSV2JSON(csvToJsonArr);

                log.debug('csvToJsonArr', csvToJsonArr);

                csvToJsonArr.forEach(function(e) {

                    var id = e["Coupon Code"];

                    log.debug('e', id);
                    if(id){
                       promitonRec.selectNewLine({
                          sublistId: 'recmachcustrecord_da_coupon_code_propmotion'
                      });
                      promitonRec.setCurrentSublistValue({
                          sublistId: 'recmachcustrecord_da_coupon_code_propmotion',
                          fieldId: 'name',
                          value: id
                      });
                      promitonRec.commitLine({
                          sublistId: 'recmachcustrecord_da_coupon_code_propmotion'
                      });
                    }
                   

                });

                promitonRec.save();
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }

        function CSVToArray(strData, strDelimiter) {
            // Check to see if the delimiter is defined. If not,
            // then default to comma.
            strDelimiter = (strDelimiter || ",");
            // Create a regular expression to parse the CSV values.
            var objPattern = new RegExp((
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
            // Create an array to hold our data. Give the array
            // a default empty first row.
            var arrData = [
                []
            ];
            // Create an array to hold our individual pattern
            // matching groups.
            var arrMatches = null;
            // Keep looping over the regular expression matches
            // until we can no longer find a match.
            while (arrMatches = objPattern.exec(strData)) {
                // Get the delimiter that was found.
                var strMatchedDelimiter = arrMatches[1];
                // Check to see if the given delimiter has a length
                // (is not the start of string) and if it matches
                // field delimiter. If id does not, then we know
                // that this delimiter is a row delimiter.
                if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
                    // Since we have reached a new row of data,
                    // add an empty row to our data array.
                    arrData.push([]);
                }
                // Now that we have our delimiter out of the way,
                // let's check to see which kind of value we
                // captured (quoted or unquoted).
                if (arrMatches[2]) {
                    // We found a quoted value. When we capture
                    // this value, unescape any double quotes.
                    var strMatchedValue = arrMatches[2].replace(
                        new RegExp("\"\"", "g"), "\"");
                } else {
                    // We found a non-quoted value.
                    var strMatchedValue = arrMatches[3];
                }
                // Now that we have our value string, let's add
                // it to the data array.
                arrData[arrData.length - 1].push(strMatchedValue);
            }
            // Return the parsed data.
            log.debug('arrData', arrData);
          return arrData;
            return arrData.filter(function(e) {
                return e.length > 1
            });
        }


        function CSV2JSON(csv) {
            var array = CSVToArray(csv);
            log.debug('array', array);
            var objArray = [];
            for (var i = 1; i < array.length; i++) {
                objArray[i - 1] = {};
                for (var k = 0; k < array[0].length && k < array[i].length; k++) {
                    var key = array[0][k];
                    objArray[i - 1][key] = array[i][k]
                }
            }

            return objArray;
        }
        return {
            onAction: onAction
        };
    });