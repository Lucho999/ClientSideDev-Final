import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown,
  PropertyPaneDropdownOptionType,
  IPropertyPaneDropdownOption
} from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';

import styles from './PictureWebpartWebPart.module.scss';
import * as strings from 'PictureWebpartWebPartStrings';
import { sp, TemplateFileType } from "@pnp/sp";
import { setup } from '@pnp/sp/src/config/splibconfig';

import ItemHelper from './Helpers/ItemHelper'
import SetupHelper from './Helpers/SetupHelper';

export interface IPictureWebpartWebPartProps {
  description: string;
  filter: string;
}

export default class PictureWebpartWebPart extends BaseClientSideWebPart<IPictureWebpartWebPartProps> {
  private choiceOptions : IPropertyPaneDropdownOption[];
  
  
  public onInit(): Promise<void> {
    return super.onInit().then(_ => {
      sp.setup({
        spfxContext: this.context
      });
      sp.web.lists.getByTitle('Picture%20Library').fields.getById('76cb9b00-79b1-48d8-a286-f9912553ea86').get()
        .then(data => {
          var options : IPropertyPaneDropdownOption[] = [];
          options.push({
              key: "all",
              index: 0,
              text: "All"
          }),
          data.Choices.forEach((choice, idx) => {
            options.push({
              key: choice,
              index: idx+1,
              text: choice
            });
          });
          this.choiceOptions = options;

        });
    });
  }


  public render(): void {
    this.domElement.innerHTML = `
        <div>   
            <div>
            <h3 style="text-align:center">Welcome to the picture manager</h3>
            <hr />
            </div>

            <div style="margin-bottom:5px; text-align:center">
                  <div style="display:flex; flex-direction:column;justify-content:center">
                    <input type='Button' id='displayLists' value='Add Filter' />
                    <select id="categorySelector">
                    <option value="all">All</option>
                    </select>
                  </div>
                <button class="button border" id="newItem" style="width: 50%; margin:10px;" >
                    Add new item
                </button>
            </div>


            <div id="newItemSection" class="${styles.notActive}" style="width:400px; max-width:100%; margin:0 auto;" >
                  <div style="display:flex; flex-direction:column;justify-content:center">
                      <input id="newTitle" type="text" value="Title" style="margin: 5px 0 " />
                      <input id="newDesc" type="text" value="Description" style="margin: 5px 0 " />
                      <select id="AddSelector" style="margin: 5px 0 " >
                          <option value="all"></option>
                      </select>
                      <input id="fileUpload" type="file" style="margin: 5px 0 "/>
                      <input type='Button' id='addNewItem' value='Add Item' style="margin: 5px 0 "/>
                  </div>
            </div>

            <hr />
           
            <div class="${styles.ContainerWhenSmall}" >
              <div id="DisplayDetailsContainer" class="${styles.HideImgDetails}" style="display:flex;flex-direction:column;float:right;">
                  
              </div>
              <div id="DisplayImagesContainer" style="display:flex;flex-direction:row;flex-wrap:wrap;justify-content:center;" >
                   There is nothin in the library
              </div>
             
            </div>
        </div>
     
       `;
       
    //Inital Setup move this out to a setup method   
    SetupHelper.PupulateDropDownMenu('categorySelector');
    SetupHelper.PupulateDropDownMenu('AddSelector');
    SetupHelper.SetupOnclick();
    
    var itemHelper = new ItemHelper(this.render);
    console.log(escape(this.properties.filter));
    itemHelper.GetAllItems(escape(this.properties.filter));
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            },
            {
              groupName : "Filter Property",
              groupFields: [
                PropertyPaneDropdown('filter', {
                  label:"Category",
                  options: this.choiceOptions
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
