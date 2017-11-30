/**
 * @license
 * Copyright 2017 JBoss Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppSettingsService } from "@core/app-settings.service";
import { LoggerService } from "@core/logger.service";
import { ArrayUtils } from "@core/utils/array-utils";
import { Dataservice } from "@dataservices/shared/dataservice.model";
import { DataserviceService } from "@dataservices/shared/dataservice.service";
import { DataservicesConstants } from "@dataservices/shared/dataservices-constants";
import { DeploymentState } from "@dataservices/shared/deployment-state.enum";
import { VdbService } from "@dataservices/shared/vdb.service";
import { AbstractPageComponent } from "@shared/abstract-page.component";
import { ConfirmDeleteComponent } from "@shared/confirm-delete/confirm-delete.component";
import { IdFilter } from "@shared/id-filter";
import { LayoutType } from "@shared/layout-type.enum";
import { SortDirection } from "@shared/sort-direction.enum";
import { NotificationType } from "patternfly-ng";
import { Subscription } from "rxjs/Subscription";

@Component({
  moduleId: module.id,
  selector: "app-dataservices",
  templateUrl: "./dataservices.component.html",
  styleUrls: ["./dataservices.component.css"]
})
export class DataservicesComponent extends AbstractPageComponent {

  public readonly addDataserviceLink: string = DataservicesConstants.addDataservicePath;

  private allServices: Dataservice[] = [];
  private filteredServices: Dataservice[] = [];
  private selectedServices: Dataservice[] = [];
  private dataserviceNameForDelete: string;
  private router: Router;
  private appSettingsService: AppSettingsService;
  private dataserviceService: DataserviceService;
  private vdbService: VdbService;
  private filter: IdFilter = new IdFilter();
  private sortDirection: SortDirection = SortDirection.ASC;
  private exportNotificationHeader: string;
  private exportNotificationMessage: string;
  private exportNotificationType = NotificationType.SUCCESS;
  private exportNotificationHidden = true;
  private dataserviceStateSubscription: Subscription;

  @ViewChild(ConfirmDeleteComponent) private confirmDeleteDialog: ConfirmDeleteComponent;

  constructor(router: Router, route: ActivatedRoute, dataserviceService: DataserviceService,
              logger: LoggerService, appSettingsService: AppSettingsService, vdbService: VdbService ) {
    super(route, logger);
    this.router = router;
    this.appSettingsService = appSettingsService;
    this.dataserviceService = dataserviceService;
    this.vdbService = vdbService;
    // Register for dataservice state changes
    this.dataserviceStateSubscription = this.dataserviceService.dataserviceStateChange.subscribe((serviceStateMap) => {
      this.onDataserviceStateChanged(serviceStateMap);
    });
  }

  public loadAsyncPageData(): void {
    const self = this;
    this.dataserviceService
      .getAllDataservices()
      .subscribe(
        (dataservices) => {
          self.allServices = dataservices;
          self.filteredServices = this.filterDataservices();
          self.dataserviceService.updateDataserviceStates();  // trigger refresh in event of new deployment
          self.loaded("dataservices");
        },
        (error) => {
          self.error(error, "Error getting dataservices");
        }
      );
  }

  /**
   * @returns {boolean} true if dataservices are being represented by cards
   */
  public get isCardLayout(): boolean {
    return this.appSettingsService.dataservicesPageLayout === LayoutType.CARD;
  }

  /**
   * @returns {boolean} true if dataservices are being represented by items in a list
   */
  public get isListLayout(): boolean {
    return this.appSettingsService.dataservicesPageLayout === LayoutType.LIST;
  }

  /**
   * @returns {boolean} true if sorting dataservice names in ascending order
   */
  public get isSortAscending(): boolean {
    return this.sortDirection === SortDirection.ASC;
  }

  /**
   * @returns {boolean} true if sorting dataservice names in descending order
   */
  public get isSortDescending(): boolean {
    return this.sortDirection === SortDirection.DESC;
  }

  /**
   * @returns {Dataservice[]} the array of all dataservices
   */
  public get allDataservices(): Dataservice[] {
    return this.allServices;
  }

  /**
   * @returns {Dataservice[]} the array of filtered dataservices
   */
  public get filteredDataservices(): Dataservice[] {
    return this.filteredServices;
  }

  /**
   * @returns {Dataservice[]} the array of selected dataservices
   */
  public get selectedDataservices(): Dataservice[] {
    return this.selectedServices;
  }

  public onSelected(dataservice: Dataservice): void {
    // Only allow one item to be selected
    this.selectedServices.shift();
    this.selectedServices.push(dataservice);
  }

  public onDeselected(dataservice: Dataservice): void {
    // Only one item is selected at a time
    this.selectedServices.shift();
    // this.selectedServices.splice(this.selectedServices.indexOf(dataservice), 1);
  }

  public onActivate(svcName: string): void {
    const selectedService =  this.filterDataservices().find((x) => x.getId() === svcName);
    selectedService.setServiceDeploymentState(DeploymentState.LOADING);

    const self = this;
    // Start the deployment and then redirect to the dataservice summary page
    this.dataserviceService
      .deployDataservice(svcName)
      .subscribe(
        (wasSuccess) => {
          self.dataserviceService.updateDataserviceStates();
        },
        (error) => {
          self.dataserviceService.updateDataserviceStates();
        }
      );
  }

  public onTest(svcName: string): void {
    const selectedService =  this.filterDataservices().find((x) => x.getId() === svcName);
    this.dataserviceService.setSelectedDataservice(selectedService);

    const link: string[] = [ DataservicesConstants.testDataservicePath ];
    this.logger.log("[DataservicesPageComponent] Navigating to: %o", link);
    this.router.navigate(link).then(() => {
      // nothing to do
    });
  }

  public onPublish(svcName: string): void {
    this.exportNotificationHeader = "Publishing:  ";
    this.exportNotificationMessage = "Publishing " + svcName + "...";
    this.exportNotificationType = NotificationType.INFO;
    this.exportNotificationHidden = false;
    this.logger.log("[DataservicesPageComponent] Publishing Dataservice: " + svcName);
    const self = this;
    this.dataserviceService
      .exportDataservice(svcName)
      .subscribe(
        (wasSuccess) => {
          self.exportNotificationHeader = "Publish Succeeded:  ";
          self.exportNotificationMessage = "   " + svcName + " was published successfully!";
          self.exportNotificationType = NotificationType.SUCCESS;
          this.logger.log("[DataservicesPageComponent] Publish Dataservice was successful");
        },
        (error) => {
          self.exportNotificationHeader = "Publish Failed:  ";
          self.exportNotificationMessage = "   Failed to publish dataservice " + svcName + "!";
          self.exportNotificationType = NotificationType.DANGER;
          this.logger.log("[DataservicesPageComponent] Publish Dataservice failed.");
        }
      );
  }

  public onDelete(svcName: string): void {
    this.dataserviceNameForDelete = svcName;
    this.confirmDeleteDialog.open();
  }

  public isFiltered(): boolean {
    return this.allServices.length !== this.filteredServices.length;
  }

  public get nameFilter(): string {
    return this.filter.getPattern();
  }

  /**
   * @param {string} pattern the new pattern for the dataservice name filter (can be null or empty)
   */
  public set nameFilter( pattern: string ) {
    this.filter.setFilter( pattern );
    this.filterDataservices();
  }

  public toggleSortDirection(): void {
    if (this.sortDirection === SortDirection.ASC) {
      this.sortDirection = SortDirection.DESC;
    } else {
      this.sortDirection = SortDirection.ASC;
    }
    this.filterDataservices();
  }

  public clearFilters(): void {
    this.filter.reset();
    this.filterDataservices();
  }

  public setListLayout(): void {
    this.appSettingsService.dataservicesPageLayout = LayoutType.LIST;
  }

  public setCardLayout(): void {
    this.appSettingsService.dataservicesPageLayout = LayoutType.CARD;
  }

  /**
   * Called to doDelete all selected APIs.
   */
  public onDeleteDataservice(): void {
    const selectedService =  this.filterDataservices().find((x) => x.getId() === this.dataserviceNameForDelete);

    // const itemsToDelete: Dataservice[] = ArrayUtils.intersect(this.selectedServices, this.filteredServices);
    // const selectedService = itemsToDelete[0];

    // Note: we can only doDelete selected items that we can see in the UI.
    this.logger.log("[DataservicesPageComponent] Deleting selected Dataservice.");
    const self = this;
    this.dataserviceService
      .deleteDataservice(selectedService.getId())
      .subscribe(
        (wasSuccess) => {
          self.undeployVdb(selectedService.getServiceVdbName());
          self.removeDataserviceFromList(selectedService);
        },
        (error) => {
          self.error(error, "Error deleting the dataservice");
        }
      );
  }

  /**
   * Filters and sorts the list of dataservices based on the user input
   */
  public filterDataservices(): Dataservice[] {
    // Clear the array first.
    this.filteredServices.splice(0, this.filteredServices.length);

    // filter
    for (const dataservice of this.allServices) {
      if (this.filter.accepts(dataservice)) {
        this.filteredServices.push(dataservice);
      }
    }

    // sort
    Dataservice.sort( this.filteredDataservices, this.sortDirection );
    this.selectedServices = ArrayUtils.intersect(this.selectedServices, this.filteredServices);

    return this.filteredServices;
  }

  /*
   * Undeploy the Vdb with the specified name
   * @param {string} vdbName the name of the Vdb
   */
  private undeployVdb(vdbName: string): void {
    this.vdbService
      .undeployVdb(vdbName)
      .subscribe(
        (wasSuccess) => {
          // nothing to do
        },
        (error) => {
          // nothing to do
        }
      );
  }

  /*
   * Remove the specified Dataservice from the list of dataservices
   */
  private removeDataserviceFromList(dataservice: Dataservice): void {
    this.allServices.splice(this.allServices.indexOf(dataservice), 1);
    this.filterDataservices();
  }

  /*
   * Update the displayed dataservice states using the provided states
   */
  private onDataserviceStateChanged(stateMap: Map<string, DeploymentState>): void {
      // For displayed dataservices, update the State using supplied services
      for ( const dService of this.filteredDataservices ) {
        const serviceId = dService.getId();
        if (stateMap && stateMap.has(serviceId)) {
          dService.setServiceDeploymentState(stateMap.get(serviceId));
        }
      }
  }

}
