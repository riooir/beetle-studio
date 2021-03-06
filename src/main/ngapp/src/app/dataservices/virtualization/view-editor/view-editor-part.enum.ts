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

export enum ViewEditorPart {

  /**
   * The source of the event is the canvas part.
   */
  CANVAS = "CANVAS",

  /**
   * The source of the event is the editor.
   */
  EDITOR = "EDITOR",

  /**
   * The source of the event is the header part.
   */
  HEADER = "HEADER",

  /**
   * The source of the event is the message log part.
   */
  MESSAGE_LOG = "MESSAGE_LOG",

  /**
   * The source of the event is the preview part.
   */
  PREVIEW = "PREVIEW",

  /**
   * The source of the event is the properties part.
   */
  PROPERTIES = "PROPERTIES",

  /**
   * The source of the event is the properties part.
   */
  COLUMNS = "COLUMNS"

}
