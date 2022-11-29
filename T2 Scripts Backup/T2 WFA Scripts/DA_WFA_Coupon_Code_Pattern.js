/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/task', 'N/search', 'N/record'],
    function(task, search, record) {
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
                var recId = scriptContext.newRecord.id;

                var promitonRec = record.load({
                    type :'customrecord_da_promotion',
                    id : recId,
                    isDynamic : true
                });

                var alphaNumericExp = /((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/i;
                var onlyLetters = /^[A-Za-z]+$/;
                var onlyNumbers = /^[0-9]+$/;

                var codePattern = scriptContext.newRecord.getValue('custrecord_da_cust_item_promo_cod_pattrn');

                var patterns = codePattern.split("-");
                log.debug('patterns', patterns);
                log.debug('patterns', patterns.length);
                var noOfCodes = scriptContext.newRecord.getValue('custrecord_da_cust_item_promo_num_codes');

                var j = 0;

                while (j < noOfCodes) {

  

                    var generatedCode= "";

                    for(var i =  0 ; i < patterns.length ; i++){
                        var pattern = patterns[i];
                        log.debug('pattern', pattern);

                        if(generatedCode){
                            generatedCode = generatedCode+"-";
                        }

                        if(pattern.match(alphaNumericExp)){
                            var value = randomString(pattern.length, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
                            generatedCode = generatedCode+""+value;
                        }
                        if(pattern.match(onlyLetters)){
                            var value =randomString(pattern.length, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
                            generatedCode = generatedCode+""+value;
                        }
                        if(pattern.match(onlyNumbers)){
                            var value =randomString(pattern.length, '0123456789');
                            generatedCode = generatedCode+""+value;
                        }
                    }
                     promitonRec.selectNewLine({
                          sublistId: 'recmachcustrecord_da_coupon_code_propmotion'
                      });
                      promitonRec.setCurrentSublistValue({
                          sublistId: 'recmachcustrecord_da_coupon_code_propmotion',
                          fieldId: 'name',
                          value: generatedCode.toUpperCase()
                      });
                      promitonRec.commitLine({
                          sublistId: 'recmachcustrecord_da_coupon_code_propmotion'
                      });
                      log.debug('generatedCode', generatedCode); 
                      j++;

                }

                promitonRec.save();

                 
                      
            } catch (ex) {
                log.error(ex.name, ex.message);
            }
        }

        function randomString(length, chars) {
                var result = '';
                for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
                return result;
        }
        return {
            onAction: onAction
        };
    });