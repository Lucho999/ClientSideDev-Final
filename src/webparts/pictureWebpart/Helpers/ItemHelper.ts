import { sp } from "@pnp/sp";
import PictureWebpartWebPart  from '../PictureWebpartWebPart';
import styles from '../PictureWebpartWebPart.module.scss';

import SetupHelper from './SetupHelper';

export default class ItemHelper {
    private _renderMethod: () =>void;

    constructor(renderMethod: () =>void )
    {
            this._renderMethod = renderMethod;
    }
    
    // Add Item
    private Additem(){
        var title= document.getElementById('newTitle') as HTMLInputElement;
        var description =document.getElementById('newDesc') as HTMLInputElement;
        var x = document.getElementById('AddSelector') as HTMLSelectElement;
        var category = x.options[x.options.selectedIndex].text;
        var filePicker = document.getElementById("fileUpload") as HTMLInputElement;
        var file = filePicker.files[0];
        var list ="Picture%20Library";
        //first adds it then updates and then rerenders page
        sp.web.lists.getByTitle("Picture%20Library").rootFolder.files.add(file.name,file, true).then((result)=> {
            result.file.listItemAllFields.get().then((listItemAllFields:any) =>{
                sp.web.lists.getByTitle(list).items.getById(listItemAllFields.Id).update({
                    
                    Title: title.value,
                    Description: description.value,
                    PC_PictureCat: category
                }).then(i => {
                    this._renderMethod();
                });
            });
        })
    }
    public AddItemEventHandler(){
        var Addbutton = document.getElementById("addNewItem") as HTMLInputElement;
        Addbutton.addEventListener("click", () =>{
            this.Additem();
        });
    }

    //Update Item
    private UpdateItem(id){
        var title= document.getElementById('updateTitle') as HTMLInputElement;
        var description =document.getElementById('updateDe') as HTMLTextAreaElement;
        var x = document.getElementById('changeSelector') as HTMLSelectElement;
        var category = x.options[x.options.selectedIndex].text;
        let list = sp.web.lists.getByTitle("Picture%20Library");

        list.items.getById(id).update({
            Title: title.value,
            Description: description.value,
            PC_PictureCat: category
        }).then(i => {
            console.log(i.item);
            this._renderMethod();
        });
    }
    public UpdateItemEventHandler(id){
        var updateButton = document.getElementById("updateButton") as HTMLButtonElement;
        updateButton.addEventListener("click", ()=> {
            this.UpdateItem(id);
          });
    }
    //Delete Items
    public DeleteItem(id){
        if (confirm('Are you sure you want delete this item?')){
            let list = sp.web.lists.getByTitle("Picture%20Library");
            list.items.getById(id).delete().then(_ => {
                console.log("Deleted Item ID: " + id);
                this._renderMethod();
            });
            
        }
        
    }
    public AddDeleteItemHandler(){
        var deleteButtons = document.getElementsByClassName(styles.deleteButton);
        for (var i = 0; i < deleteButtons.length; i++) {
          ( (x)=> {
            deleteButtons[x].addEventListener("click", ()=> {
             this.DeleteItem(deleteButtons[x].id);
          });
      })(i);
      }
    }
    //display Items
    public GetAllItems(choice="all"){
        var imgcontatiner = document.getElementById('DisplayImagesContainer');
        imgcontatiner.innerHTML="";
      
        sp.web.lists.getByTitle("Picture%20Library").items.select("FileRef", "Title", "id", "Description", "PC_PictureCat").getAll().then(data => {
            for(let i = 0;i <data.length; i++){
                if(choice == data[i].PC_PictureCat || choice == "all" ){
                    imgcontatiner.innerHTML += `
                    <div id="ImageCard"  class="ImageCard" style="max-height:400px;margin:5px;" >
                        <div class="${styles["flip-container"]}" ontouchstart="this.classList.toggle('hover');">
                            <div class="${styles.flipper}" id="flipper${data[i].Id}">
                                <div class="${styles.front}">
                                        <div class="${styles.titleThumbnail}" >${data[i].Title}</div>
                                        <img class="${styles.imgThumbnail}" src="https://folkis2017.sharepoint.com/${data[i].FileRef}" />
                                </div>
                                <div class="${styles.back}">
                                    <div class="${styles.backside} backsideShow" id="${data[i].Id}" >
                                            Press for Details 
                                    </div>
                                    <div class="${styles.backside} ${styles.hide} backsideHide" id="hideDetails${data[i].Id}">
                                        Press to Hide
                                    </div>
                                    <input type='Button' class="${styles.deleteButton}" id="${data[i].Id}" value='Delete'>
                                </div>
                            </div>
                        </div>
                    </div>`;
                }
            }
          this.AddDisplayImgEventHandler();
          this.AddDeleteItemHandler();
          this.AddItemEventHandler();          
     
        });
    }

 
    public AddDisplayImgEventHandler(){
          var showdetails = document.getElementsByClassName('backsideShow');
          for (var i = 0; i < showdetails.length; i++) {
            ( (x)=> {
                showdetails[x].addEventListener("click", ()=> {
               this.DisplayImgDetails(showdetails[x].id);
            });
        })(i);
        }
        
        var hideDetails = document.getElementsByClassName('backsideHide');
        for (var i = 0; i < hideDetails.length; i++) {
          ( (x)=> {
            hideDetails[x].addEventListener("click", ()=> {
            this.CardEffectsOnHide(hideDetails[x],false, false, hideDetails[x].id);
          });
      })(i);
      }
    }

    // denna kan man förenkla och ta bort alla parameters utan targetdivtohide.. där får jag allt id och allt sånt.
    public CardEffectsOnHide(TargetDivToHide, ShowDetailsBool:boolean, sticky: boolean, id){
        var newId = id.slice(11);

        var TargetDivToShow = document.getElementById(newId);
        var ShowDetailsDiv = document.getElementById('DisplayDetailsContainer');
        //Should stick or not
        if(sticky){
            var flipper = document.getElementById('flipper'+newId);
            flipper.classList.add(styles.flipped);
        }
        else{
            var flipper = document.getElementById('flipper'+newId);
            flipper.classList.remove(styles.flipped); 
            TargetDivToHide.classList.add(styles.hide);
            TargetDivToShow.classList.remove(styles.hide);
        }

        //show details or hide Funkar
        if(ShowDetailsBool){
            if(ShowDetailsDiv.classList.contains(styles.HideImgDetails)){
                ShowDetailsDiv.classList.remove(styles.HideImgDetails);
            }
        }
        else{
            ShowDetailsDiv.classList.add(styles.HideImgDetails);
        }
    }


    //Remove any cards that are sticky
    public RemoveAnyStickyCards(){
        var anyFlipped = document.getElementsByClassName(styles.flipped) as HTMLCollection;
        if(anyFlipped.length > 0){
           for(var i = 0;i <anyFlipped.length ; i++){
           
            var newId = anyFlipped[i].id.slice(7);
            var hideButtonPressToHide = document.getElementById("hideDetails"+newId)
            var showButtonDetails = document.getElementById(newId);

            showButtonDetails.classList.remove(styles.hide);
            hideButtonPressToHide.classList.add(styles.hide);
            anyFlipped[i].classList.remove(styles.flipped);
           }
        }

    }

    public StickCard(id){
        this.RemoveAnyStickyCards();

        var flipper = document.getElementById('flipper'+id);
        flipper.classList.toggle(styles.flipped);

        var hideDetails = document.getElementById(id);
        hideDetails.classList.toggle(styles.hide);

        var showHidden = document.getElementById("hideDetails" +id);
        showHidden.classList.toggle(styles.hide);
    }
   
    // Displays img details on the side screen
    public DisplayImgDetails(id){
    
        var targetDiv = document.getElementById('DisplayDetailsContainer');
        if(targetDiv.classList.contains(styles.DisplayImgDetails)){
            targetDiv.classList.add(styles.HideImgDetails);
        }

        setTimeout(() => {
            sp.web.lists.getByTitle("Picture%20Library").items.getById(id).select("FileRef", "Title", "id", "Description", "PC_PictureCat").get()
            .then(data => {
                targetDiv.innerHTML = `
                    <input id="updateTitle" type='text' value='${data.Title}' style="margin:0 0 5px 0px;">
                    <select id="changeSelector">
                    </select>
                    <img src="https://folkis2017.sharepoint.com/${data.FileRef}" style="width:230px; height:200px; margin:5px auto;"/>
                    <textarea id="updateDe" type='text' cols="30" rows="5">${data.Description}</textarea>
                    <input id="updateButton" type='button' value='Save Changes'>`;
                SetupHelper.PupulateDropDownMenu("changeSelector",data.PC_PictureCat);
                this.UpdateItemEventHandler(id);
                
                if(targetDiv.classList.contains(styles.HideImgDetails)){
                    
                    targetDiv.classList.add(styles.DisplayImgDetails);
                    targetDiv.classList.remove(styles.HideImgDetails);
                }
            });
           
           this.StickCard(id);
        }, 300);
       
    }


}