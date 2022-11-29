/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
define(['N/search','N/record'],

		function(search,record) {

	/**
	 * Definition of the Suitelet script trigger point.
	 *
	 * @param {Object} scriptContext
	 * @param {Record} scriptContext.newRecord - New record
	 * @param {Record} scriptContext.oldRecord - Old record
	 * @Since 2016.1
	 */
	function onAction(scriptContext) {
		try{
			var employee =  scriptContext.newRecord.getValue('custrecord_da_ind_cal_name');
			var indemnityType  = scriptContext.newRecord.getValue('custrecord_da_indemnity_type');
			var relaeseDate = scriptContext.newRecord.getValue('custrecord_da_ind_cal_last_work_day');

			var empRecord = record.load({
				type:'employee',
				id: employee
			});
			if(indemnityType == 1){
				empRecord.setValue('employeestatus',4); //term
			}

			if(indemnityType == 2){
				empRecord.setValue('employeestatus',3); //resign
			}

			empRecord.setValue('releasedate',relaeseDate);
			//empRecord.setValue('isinactive',true);
			empRecord.save();
          
            scriptContext.newRecord.setValue('custrecord_is_indemniity_paid',true);
		}catch(ex){
			log.error(ex.name,ex.message);
		}

	}

	return {
		onAction : onAction
	};

});