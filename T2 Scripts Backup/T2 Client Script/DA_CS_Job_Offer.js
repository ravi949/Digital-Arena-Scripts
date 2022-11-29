/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 */
define(['N/search','N/record','N/format','N/url'],

		function(search,record,format,url) {
  function OpenPrint(id){
    try {
        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_da_su_job_offer',
            deploymentId: 'customdeploy_da_su_job_offer',
          params:{
            id:id
          }
        });
      console.log(suiteletURL);
      window.open(suiteletURL);
    }
   catch(e) {
        log.error(e.name, e.message);
    }
  }
   function OpenPrint1(id){
    try {
        var suiteletURL = url.resolveScript({
            scriptId: 'customscript_da_su_interview_evalution',
            deploymentId: 'customdeploy_da_su_interview_evalution',
          params:{
            id:id
          }
        });
      console.log(suiteletURL);
      window.open(suiteletURL);
    }
   catch(e) {
        log.error(e.name, e.message);
    }
  }
  

	/**
	 * Function to be executed after page is initialized.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
	 *
	 * @since 2015.2
	 */
	function pageInit(scriptContext) {
		try{
			if(scriptContext.mode == CREATE){
			var candidateName = scriptContext.currentRecord.getValue('custrecord_da_job_candidate_name');
			log.debug('candidateName',candidateName);
			var sublist = scriptContext.currentRecord.getSublist({
                  sublistId: 'recmachcustrecord_da_parent_job_offer'
                  });
                  log.debug('sublist',sublist);
                  scriptContext.currentRecord.selectNewLine({
                 sublistId: 'recmachcustrecord_da_parent_job_offer'
                });
                  scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_parent_job_offer',
                      fieldId: 'custrecord_da_elements_of_eve',
                       value: 'المؤهل والتعليم,',
                    ignoreFieldChange: true
                   });
                  scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_parent_job_offer',
                      fieldId: 'custrecord_da_explanation',
                       value: 'المرشح لديه المؤهلات المطلوبة والتعليم المناسب للوظيفة ',
                    ignoreFieldChange: true
                   });
                       scriptContext.currentRecord.commitLine({
                        sublistId: 'recmachcustrecord_da_parent_job_offer'
                      });
                        scriptContext.currentRecord.selectNewLine({
                 sublistId: 'recmachcustrecord_da_parent_job_offer'
                });
                  scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_parent_job_offer',
                      fieldId: 'custrecord_da_elements_of_eve',
                       value: 'االتدريب والشهادات المهنية ',
                    ignoreFieldChange: true
                   });
                  scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_parent_job_offer',
                      fieldId: 'custrecord_da_explanation',
                       value: 'اشح يملك شهادات مهنية في مجال العمل و تدريب في متطلبات الوظيفة',
                    ignoreFieldChange: true
                   });
                       scriptContext.currentRecord.commitLine({
                        sublistId: 'recmachcustrecord_da_parent_job_offer'
                      });
                        scriptContext.currentRecord.selectNewLine({
                 sublistId: 'recmachcustrecord_da_parent_job_offer'
                });
                  scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_parent_job_offer',
                      fieldId: 'custrecord_da_elements_of_eve',
                       value: 'االخبرة المهنية والعمليه ',
                    ignoreFieldChange: true
                   });
                  scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_parent_job_offer',
                      fieldId: 'custrecord_da_explanation',
                       value: 'االمرشح لديه الخبرة الكافيه لأداء مسؤوليات الوظيفة وطريقة أدائها ',
                    ignoreFieldChange: true
                   });
                       scriptContext.currentRecord.commitLine({
                        sublistId: 'recmachcustrecord_da_parent_job_offer'
                      });
                       scriptContext.currentRecord.selectNewLine({
                 sublistId: 'recmachcustrecord_da_parent_job_offer'
                });
                  scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_parent_job_offer',
                      fieldId: 'custrecord_da_elements_of_eve',
                       value: 'امهارات التواصل ',
                    ignoreFieldChange: true
                   });
                  scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_parent_job_offer',
                      fieldId: 'custrecord_da_explanation',
                       value: 'المرشح أظهر القدرة على التواصل بشكل جيد من جميع النواحي ',
                    ignoreFieldChange: true
                   });
                       scriptContext.currentRecord.commitLine({
                        sublistId: 'recmachcustrecord_da_parent_job_offer'
                      });
                          scriptContext.currentRecord.selectNewLine({
                 sublistId: 'recmachcustrecord_da_parent_job_offer'
                });
                  scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_parent_job_offer',
                      fieldId: 'custrecord_da_elements_of_eve',
                       value: 'المهارات التقنية',
                    ignoreFieldChange: true
                   });
                  scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_parent_job_offer',
                      fieldId: 'custrecord_da_explanation',
                       value: 'االمرشح لديه المعرفه في التعامل مع برامج الحاسب الالي والأنظمة المرتبطة   واجبات العمل ',
                    ignoreFieldChange: true
                   });
                       scriptContext.currentRecord.commitLine({
                        sublistId: 'recmachcustrecord_da_parent_job_offer'
                      });
                        scriptContext.currentRecord.selectNewLine({
                 sublistId: 'recmachcustrecord_da_parent_job_offer'
                });
                  scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_parent_job_offer',
                      fieldId: 'custrecord_da_elements_of_eve',
                       value: 'امهارات القيادة ',
                    ignoreFieldChange: true
                   });
                  scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_parent_job_offer',
                      fieldId: 'custrecord_da_explanation',
                       value: 'االمرشح أظهر القدرة على المشاركة الفعاله في بيئة عمل الفريق والتحفيز وقيادة  الموظفين',
                    ignoreFieldChange: true
                   });
                       scriptContext.currentRecord.commitLine({
                        sublistId: 'recmachcustrecord_da_parent_job_offer'
                      });
                       scriptContext.currentRecord.selectNewLine({
                 sublistId: 'recmachcustrecord_da_parent_job_offer'
                });
                  scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_parent_job_offer',
                      fieldId: 'custrecord_da_elements_of_eve',
                       value: 'االمهارات الأساسية ',
                    ignoreFieldChange: true
                   });
                  scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_parent_job_offer',
                      fieldId: 'custrecord_da_explanation',
                       value: 'المرشح يملك مهارات : الإقناع , التفاوض , حل المشكلات , إدارة الأزمات , العمل مع الفريق',
                    ignoreFieldChange: true
                   });
                       scriptContext.currentRecord.commitLine({
                        sublistId: 'recmachcustrecord_da_parent_job_offer'
                      });
                       scriptContext.currentRecord.selectNewLine({
                 sublistId: 'recmachcustrecord_da_parent_job_offer'
                });
                  scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_parent_job_offer',
                      fieldId: 'custrecord_da_elements_of_eve',
                       value: 'االتقديم',
                    ignoreFieldChange: true
                   });
                  scriptContext.currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_da_parent_job_offer',
                      fieldId: 'custrecord_da_explanation',
                       value: 'ادقه في الوقت , السيرة الذاتيه , المظهر ',
                    ignoreFieldChange: true
                   });
                       scriptContext.currentRecord.commitLine({
                        sublistId: 'recmachcustrecord_da_parent_job_offer'
                      });

		
                   }
               }
              
              catch(ex){
			console.log(ex.name,ex.message);
		}


	}

	/**
	 * Function to be executed when field is changed.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @param {string} scriptContext.sublistId - Sublist name
	 * @param {string} scriptContext.fieldId - Field name
	 * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
	 * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
	 *
	 * @since 2015.2
	 */
	function fieldChanged(scriptContext) {
		try{
			
		}catch(ex){
			console.log(ex.name,ex.message);
		}

	}

	

	/**
	 * Function to be executed when field is slaved.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @param {string} scriptContext.sublistId - Sublist name
	 * @param {string} scriptContext.fieldId - Field name
	 *
	 * @since 2015.2
	 */
	function postSourcing(scriptContext) {

	}

	/**
	 * Function to be executed after sublist is inserted, removed, or edited.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @param {string} scriptContext.sublistId - Sublist name
	 *
	 * @since 2015.2
	 */
	function sublistChanged(scriptContext) {

	}

	/**
	 * Function to be executed after line is selected.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @param {string} scriptContext.sublistId - Sublist name
	 *
	 * @since 2015.2
	 */
	function lineInit(scriptContext) {

	}

	/**
	 * Validation function to be executed when field is changed.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @param {string} scriptContext.sublistId - Sublist name
	 * @param {string} scriptContext.fieldId - Field name
	 * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
	 * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
	 *
	 * @returns {boolean} Return true if field is valid
	 *
	 * @since 2015.2
	 */
	function validateField(scriptContext) {

	}

	/**
	 * Validation function to be executed when sublist line is committed.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @param {string} scriptContext.sublistId - Sublist name
	 *
	 * @returns {boolean} Return true if sublist line is valid
	 *
	 * @since 2015.2
	 */
	function validateLine(scriptContext) {

	}

	/**
	 * Validation function to be executed when sublist line is inserted.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @param {string} scriptContext.sublistId - Sublist name
	 *
	 * @returns {boolean} Return true if sublist line is valid
	 *
	 * @since 2015.2
	 */
	function validateInsert(scriptContext) {

	}

	/**
	 * Validation function to be executed when record is deleted.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @param {string} scriptContext.sublistId - Sublist name
	 *
	 * @returns {boolean} Return true if sublist line is valid
	 *
	 * @since 2015.2
	 */
	function validateDelete(scriptContext) {

	}

	/**
	 * Validation function to be executed when record is saved.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.currentRecord - Current form record
	 * @returns {boolean} Return true if record is valid
	 *
	 * @since 2015.2
	 */
	function saveRecord(scriptContext) {

	}

	return {
		pageInit: pageInit,
//		fieldChanged: fieldChanged,
//		postSourcing: postSourcing,
//		sublistChanged: sublistChanged,
//		lineInit: lineInit,
//		validateField: validateField,
//		validateLine: validateLine,
//		validateInsert: validateInsert,
//		validateDelete: validateDelete,
//		saveRecord: saveRecord,
           OpenPrint:OpenPrint,
       OpenPrint1:OpenPrint1
       
	}

});