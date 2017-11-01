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

import { ActivitiesConstants } from "@activities/shared/activities-constants";
import { Component, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { ConnectionsConstants } from "@connections/shared/connections-constants";
import { DataservicesConstants } from "@dataservices/shared/dataservices-constants";
import { LoggerService } from "@core/logger.service";

/**
 * Models the menus off the main left-hand vertical nav.
 */
enum VerticalNavType {
  Home, Activities, Connections, Dataservices
}

@Component({
  moduleId: module.id,
  selector: "app-vertical-nav",
  templateUrl: "./vertical-nav.component.html",
  styleUrls: ["./vertical-nav.component.less"]
})

export class VerticalNavComponent implements OnInit {

  public menuTypes: any = VerticalNavType;
  public currentMenu: VerticalNavType = VerticalNavType.Home;
  private logger: LoggerService;
  private router: Router;

  constructor(router: Router, logger: LoggerService) {
    this.router = router;
    this.logger = logger;
  }

  public ngOnInit(): void {
    this.logger.log("Subscribing to router events.");
    const self = this;
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        self.onShadeClick();
      }
    });
  }

  /**
   * Called when the user clicks the vertical menu Activities item.
   */
  public onActivitiesClick(): void {
    this.currentMenu = VerticalNavType.Activities;
    const link: string[] = [ ActivitiesConstants.activitiesRootPath ];
    this.router.navigate(link).then(() => {
      // nothing to do
    });
  }

  /**
   * Called when the user clicks the vertical menu Connections item.
   */
  public onConnectionsClick(): void {
    this.currentMenu = VerticalNavType.Connections;
    const link: string[] = [ ConnectionsConstants.connectionsRootPath ];
    this.router.navigate(link).then(() => {
      // nothing to do
    });
  }

  /**
   * Called when the user clicks the vertical menu Dataservices item.
   */
  public onDataservicesClick(): void {
    this.currentMenu = VerticalNavType.Dataservices;
    const link: string[] = [ DataservicesConstants.dataservicesRootPath ];
    this.router.navigate(link).then(() => {
      // nothing to do
    });
  }

  /**
    * Called when the user clicks the vertical menu shade (the grey shaded area behind the submenu div that
    * is displayed when a sub-menu is selected).  Clicking the shade makes the sub-menu div go away.
    */
  private onShadeClick(): void {
      /*
        this.subMenuOut = false;
        setTimeout(() => {
            this.currentSubMenu = VerticalNavSubMenuType.None;
        }, 180);
        */
    }

    /**
     * Toggles a sub-menu off the main vertical left-hand menu bar.  If the sub-menu is
     * already selected, it de-selects it.
     * @param subMenu the sub-menu to toggle
     */
    /*
    toggleSubMenu(subMenu: VerticalNavSubMenuType): void {
        if (this.subMenuOut && this.currentSubMenu === subMenu) {
            this.onShadeClick();
        } else {
            this.currentSubMenu = subMenu;
            this.subMenuOut = true;
        }
    }
    */

}
