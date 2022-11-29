/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 29 Apr 2013 tcaguioa
 * 
 */





/**
* @param {Number}
*        toversion
* @returns {Void}
*/
function beforeInstall(toversion)
{
    checkDependencies();
}





/**
* @param {Number}
*        fromversion
* @param {Number}
*        toversion
* @returns {Void}
*/
function beforeUpdate(fromversion, toversion)
{
    checkDependencies();
}





function OnAfterUpdate()
{
    _CopySubsidiaryLogo();
}





function OnAfterInstall()
{
    _CopySubsidiaryLogo();
}

 



 
function checkDependencies()
{
    var objContext = nlapiGetContext();
    
    if (objContext.getSetting("FEATURE", "CUSTOMCODE") != 'T')
    {
        throw new nlobjError('INSTALLATION_ERROR', 'Client SuiteScript Feature must first be enabled before installation.');
    }

    if (objContext.getSetting("FEATURE", "SERVERSIDESCRIPTING") != 'T')
    {
        throw new nlobjError('INSTALLATION_ERROR', 'Server SuiteScript Feature must first be enabled before installation.');
    }

    if (objContext.getSetting("FEATURE", "SUBSIDIARIES") != 'T')
    {
        throw new nlobjError('INSTALLATION_ERROR', 'Subsidiaries Feature must first be enabled before installation.');
    }
}





function _CopySubsidiaryLogo()
{
    nlapiScheduleScript("customscript_snav_copysublogo", "customdeploy_snav_copysublogo");
}






