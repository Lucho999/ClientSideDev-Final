import { sp } from "@pnp/sp";
import PictureWebpartWebPart  from '../PictureWebpartWebPart';
import styles from '../PictureWebpartWebPart.module.scss';
import ItemHelper from "./ItemHelper";


export default class SetupHelper {
    
    public static SetupOnclick(){
        

        document.getElementById('displayLists').addEventListener("click", () =>{
            this.ApplyFilter();
        })
  
        document.getElementById('newItem').addEventListener("click", () => {
          this.Toggle('newItemSection');
        });
      
    }
    public static Toggle(id){
        var x = document.getElementById(id);
        if (x.classList.contains(styles.Toggle)) {
            x.classList.add(styles.notActive);
            x.classList.remove(styles.Toggle);
        }
        else {
            x.classList.remove(styles.notActive);
            x.classList.add(styles.Toggle);
        }
    }
    public static PupulateDropDownMenu(changeSelector, CurrentCat="All"){
        var Selector = document.getElementById(changeSelector) as HTMLSelectElement;
        // Delete all options
        var length = Selector.options.length;
        for (var i = length-1; i > 0; i--) {
            Selector.options[i] = null;
        }
        //repopulate
        sp.web.fields.getById("76cb9b00-79b1-48d8-a286-f9912553ea86").get().then(data =>{
            data.Choices.forEach(element => {
            Selector.appendChild(new Option(element, element));        
            });
            if(CurrentCat!="All"){
                this.SelectOption(changeSelector, CurrentCat);
            }
        });
    }
    public static SelectOption(idSelector, CurrentCat){
        var Selector = document.getElementById(idSelector) as HTMLSelectElement;
        for(var i=0; i < Selector.options.length;i++ ){
            if(Selector.options[i].value == CurrentCat){
                Selector.options[i].selected = true;
            }
          }
    }
    public static ApplyFilter(){
        var targetselector = document.getElementById('categorySelector') as HTMLSelectElement;
        var newCategory =  targetselector.options[targetselector.options.selectedIndex].value;
        var itemHelper = new  ItemHelper(() => { });
        itemHelper.GetAllItems(newCategory);
        this.Toggle('filterSection');
    }

}

   


    
    
    




