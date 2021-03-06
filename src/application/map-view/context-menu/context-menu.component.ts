import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DirectionComponent } from '../utility/direction/direction.component';
import { YourPlacesComponent } from '../utility/menu/navigation/your-places/your-places.component';
import { FavoritHomeComponent } from '../utility/menu/navigation/your-places/favorit-home/favorit-home.component';
import { FavoritWorkComponent } from '../utility/menu/navigation/your-places/favorit-work/favorit-work.component';
import { MeasureComponent } from '../controller/measure/measure.component';
import { MapService } from 'src/application/shared/services/map.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { ReportErrorComponent } from 'src/application/partial/report-error/report-error.component';
import { AddMissingPlaceComponent } from 'src/application/partial/add-missing-place/add-missing-place.component';
import { IranBoundryService } from 'src/application/shared/services/iran-boundry.service';

@Component({
 selector: 'app-context-menu',
 templateUrl: './context-menu.component.html',
 styleUrls: [
  './context-menu.component.scss',
 ],
 providers: [
  DirectionComponent,
  YourPlacesComponent,
  FavoritHomeComponent,
  FavoritWorkComponent,
  MeasureComponent,
 ],
})
export class ContextMenuComponent implements OnInit {
 @ViewChild('contextMenuDiv', { static: false })
 contextMenuDiv: ElementRef;
 // @ViewChild(DirectionComponent, { static: false }) direction: DirectionComponent;
 contextMenuX: number;
 contextMenuY: number;
 clientClickCoord;
 clientZoom;
 constructor(
  public mapservice: MapService,
  public publicVar: PublicVarService,
  public IranBoundry: IranBoundryService,
  private direction: DirectionComponent,
  public ReportError: ReportErrorComponent,
  public missingPlace: AddMissingPlaceComponent,
  public yourPlaces: YourPlacesComponent,
  public measure: MeasureComponent,
 ) {}

 ngOnInit() {
  this.ContextMenu();
  this.getCenterZoom();
 }
 // ---- creat custom right Click ----
 ContextMenu() {
  window.addEventListener('contextmenu', event => {
   event.preventDefault(); // jelogiri az right click defualt
   this.publicVar.isOpenContextMenu = true;
   const clientX = event.clientX;
   const clientY = event.clientY;
   let browserSizeX = window.innerWidth;
   const browserSizeY = window.innerHeight;
   let widthContextMenu;
   let heightContextMenu;
   // agar dakhel time out nazarim chon az ng if estefadeh kardim va div contexmenu dakhel dom nist
   // nemitavanim height va width ra begirim undifine mideh
   setTimeout(() => {
    widthContextMenu = this.contextMenuDiv.nativeElement.offsetWidth;
    heightContextMenu = this.contextMenuDiv.nativeElement.offsetHeight;
    // aval position contexmenu barabar ba jaye k client click kardeh qarar midahim
    // sepas baresi mikonin k aya jaye k click shode context menu kamel namayesh dadeh mishavad
    if (this.publicVar.isOpenPlaces || this.publicVar.isOpenDirection) {
     browserSizeX = browserSizeX - 380 - 1; // -1 For a better view -380 width direction va ...;
    }
    this.contextMenuY = clientY;
    this.contextMenuX = clientX;
    if (clientY >= browserSizeY - heightContextMenu && clientX >= browserSizeX - widthContextMenu) {
     this.contextMenuY = browserSizeY - heightContextMenu - 5;
     this.contextMenuX = browserSizeX - widthContextMenu;
    } else if (clientX >= browserSizeX - widthContextMenu) {
     this.contextMenuX = browserSizeX - widthContextMenu;
    } else if (clientY >= browserSizeY - heightContextMenu) {
     this.contextMenuY = browserSizeY - heightContextMenu - 5;
    }
   }, 0);
  });
  // ba har click,move,zoom agar context menu open bood an ra beband
  window.addEventListener('click', () => {
   if (this.publicVar.isOpenContextMenu) {
    this.publicVar.isOpenContextMenu = false;
   }
  });
  this.mapservice.map.getView().on('change:resolution', () => {
   if (this.publicVar.isOpenContextMenu) {
    this.publicVar.isOpenContextMenu = false;
   }
  });
  this.mapservice.map.on('movestart', evt => {
   if (this.publicVar.isOpenContextMenu) {
    this.publicVar.isOpenContextMenu = false;
   }
  });
 }

 // ---- get right click positon and zoom leve base map to set map center ----
 getCenterZoom() {
  this.mapservice.map.on('contextmenu', evt => {
   this.clientClickCoord = (evt as any).coordinate;
   this.clientZoom = this.mapservice.map.getView().getZoom();
   console.log('clientZoom : ', this.clientZoom);
   console.log('clientClickCoord : ', this.clientClickCoord);
  });
 }
 // ---- get right click positon and zoom leve base map to set map center ----
 // ----Direction FromTo Here ----
 DirectionFromToHere(elemntID: string) {
  this.publicVar.removeLayerByName('routing');
  this.direction.openDirection(elemntID);
  this.direction.LocationToAddress(this.clientClickCoord);
  this.direction.setpoint(this.clientClickCoord, elemntID);
  this.direction.searchRout();
 }
 // ----Direction FromTo Here ----

 changeExtent() {
  setTimeout(() => {
   const center = this.clientClickCoord;
   const zoom = this.clientZoom;
   if (this.publicVar.isOpenReportError) {
    this.ReportError.addMap(center, zoom);
   } else if (this.publicVar.isOpenMissingPlace) {
    this.missingPlace.addMap(center, zoom);
   }
  }, 10);
 }

}
