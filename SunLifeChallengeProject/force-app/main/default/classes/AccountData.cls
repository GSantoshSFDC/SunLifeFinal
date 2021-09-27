public class AccountData {
	@AuraEnabled(Cacheable = true)
    public static List<Account> fetchAccountData(){
        return [SELECT Id, name,Owner.Name,Phone,Website,AnnualRevenue FROM Account Where Industry = 'Financial Services' WITH SECURITY_ENFORCED];
    }
    
      @AuraEnabled
    public static string updateAccounts( Object data ) {
        List < Account > accsForUpdate = ( List < Account > ) JSON.deserialize(
            JSON.serialize( data ),
            List < Account >.class
        );
        try {
            update accsForUpdate;
            return 'Success: Account(s) updated successfully';
        }
        catch (Exception e) {
            return 'The following exception has occurred: ' + e.getMessage();
        }
    }
}