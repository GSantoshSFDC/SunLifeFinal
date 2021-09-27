import { LightningElement,wire, track } from 'lwc';
import fetchAccountData from '@salesforce/apex/AccountData.fetchAccountData';
import updateAccounts from '@salesforce/apex/AccountData.updateAccounts';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const columns = [
    {
    label: 'Account Name', 
    fieldName: 'accountIdForURL', 
    type: 'url', 
    sortable: "true",
    typeAttributes: { label: { fieldName: 'Name' }, target: '_blank' }
        
    }, {
        label: 'Account Owner',
        fieldName: 'OwnerName',
        sortable: "true",
        editable: true
    }, {
        label: 'Phone',
        fieldName: 'Phone',
        type: 'phone',
        editable: true
    }, {
        label: 'Website',
        fieldName: 'Website',
        editable: true,
        type: 'url',
    },{
        label: 'Annual Revenue',
        fieldName: 'AnnualRevenue',
        type: 'currency',
        editable: true
    },
];

export default class AccountData extends LightningElement {
    @track data;
    @track columns = columns;
    @track sortBy;
    @track sortDirection;
    wiredRecords;
    draftValues = [];

    @wire(fetchAccountData)
    contacts(result) {
        this.wiredRecords = result;
        if (result.data) {
            console.log('Data --> '+JSON.stringify(result.data));
           /* this.data = result.data;
            this.error = undefined; */

            let accountArray = [];
            result.data.forEach(account => {
               console.log('DATA 1 --> '+JSON.stringify(account));
               let accountRow = {};
                    accountRow.Name = account.Name;
                    accountRow.accountIdForURL = '/' + account.Id;  //This field will be used for navigation to the account
                    accountRow.OwnerName = account.Owner.Name;
                    accountRow.Phone = account.Phone;
                    accountRow.Website = account.Website;
                    accountRow.AnnualRevenue = account.AnnualRevenue;
                    accountRow.Id = account.Id;
                    accountArray.push(accountRow);
            });
            this.data = accountArray;

        } else if (result.error) {
            this.error = result.error;
            this.data = undefined;
        }
    }

    handleSortdata(event) {
        this.sortBy = event.detail.fieldName;

        this.sortDirection = event.detail.sortDirection;

        this.sortData(event.detail.fieldName, event.detail.sortDirection);
    }

    sortData(fieldname, direction) {
        // serialize the data before calling sort function
        let parseData = JSON.parse(JSON.stringify(this.data));

        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };

        // cheking reverse direction 
        let isReverse = direction === 'asc' ? 1: -1;

        // sorting data 
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';

            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });

        // set the sorted data to data table data
        this.data = parseData;
    }

    async handleSave( event ) {

        const updatedFields = event.detail.draftValues;
        console.log('Updated Value--> '+JSON.stringify(updatedFields));

        await updateAccounts( { data: updatedFields } )
        .then( result => {

            console.log( JSON.stringify( "Apex update result: " + result ) );
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Account(s) updated',
                    variant: 'success'
                })
            );
            
            refreshApex( this.wiredRecords ).then( () => {
                this.draftValues = [];
            });        

        }).catch( error => {

            console.log( 'Error is ' + JSON.stringify( error ) );
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating or refreshing records',
                    message: error.body.message,
                    variant: 'error'
                })
            );

        });

    }
}