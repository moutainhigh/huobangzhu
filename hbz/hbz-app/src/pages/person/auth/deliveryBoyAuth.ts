import {Component} from '@angular/core';
import {ActionSheetController, Platform, NavController, ToastController,AlertController, LoadingController, ModalController } from 'ionic-angular';
import { Camera,File,FilePath } from 'ionic-native';
import {Http}from '@angular/http';
import { Storage } from '@ionic/storage';
import { HelperService } from '../../../app/services/help.service';
import { Person } from './person';
import { Config } from '../../../app/config';


@Component({
  selector: 'deliveryBoyAuth',
  templateUrl: 'deliveryBoyAuth.html'
})
export class DeliveryBoyAuth {
    private deliveryBoyUrl: string = "/api/user/app/registry/deliveryBoy/submit";//个人配送员资质提交
    private searchUrl: string = "/api/user/app/registry/search";//资质查询
    public helperService:HelperService;

    public defaultPhoto = '';
    public certificates//身份证照片
    public certifiedPhoto;//持证证件照片
    public receiveAccountTypeObj:any={};
    public receiveAccountType='Alipay';
    public receiveAccount="";

    public isClick: string = ''; // 禁用状态: disabled || ''
    

    constructor(
        private nav:NavController,
        public alertCtrl: AlertController,
        public loadingCtrl: LoadingController,
        public toastCtrl: ToastController,
        public modalCtrl: ModalController,
        public platform:Platform,
        public actionSheetCtrl: ActionSheetController,
        private http: Http,
        public storage: Storage,
        public config:Config) {
          this.helperService = new HelperService(nav,alertCtrl,loadingCtrl,toastCtrl,storage,http,config);
          this.deliveryBoyUrl = this.helperService.api + this.deliveryBoyUrl;
          this.searchUrl = this.helperService.api + this.searchUrl;
          this.certificates = this.defaultPhoto;
          this.certifiedPhoto = this.defaultPhoto;

          this.storage.get('receiveAccountType').then((data)=>{
              this.receiveAccountTypeObj = data;
            }
          )

            this.http.post(this.searchUrl,{registryCode:'DeliveryBoy'},this.helperService.getOptions())
            .subscribe((data)=> {
                let result = data.json();
                if (result.code == '200') {
                  this.certificates = result.data.certificates;
                  this.certifiedPhoto = result.data.certifiedPhoto;
                  this.receiveAccount = result.data.receiveAccount;
                  this.receiveAccountType = result.data.receiveAccountType;
                }
              },
              (err)=> {
                this.helperService.presentToast('网络请求失败,请确保你的网络环境正常');
              });
      }


    createImage(certificatesType){
      let actionSheet = this.actionSheetCtrl.create({
        title: '选择照片',
        buttons: [
          {
            text: '相册',
            handler: () => this.storeImage(Camera.PictureSourceType.PHOTOLIBRARY,certificatesType)
          },
          {
            text: '拍照',
            handler: () => this.storeImage(Camera.PictureSourceType.CAMERA,certificatesType)
          },
          {
            text: '取消',
            role: 'cancel'
          }
        ]
      });
      actionSheet.present();
    }

    setOptions(srcType: number) {
      let options = {
        quality: 100,//相片质量0-100
        targetWidth: 1200,//照片宽度
        targetHeight: 1200, //照片高度
        destinationType: Camera.DestinationType.FILE_URI,//返回类型：DATA_URL= 0，返回作为 base64 編碼字串。 FILE_URI=1，返回影像档的 URI。NATIVE_URI=2，返回图像本机URI (例如，資產庫)
        sourceType: srcType,//从哪里选择图片：PHOTOLIBRARY=0，相机拍照=1，SAVEDPHOTOALBUM=2。0和1其实都是本地图库
        encondingType: Camera.EncodingType.JPEG, //保存的图片格式： JPEG = 0, PNG = 1
        mediaType: Camera.MediaType.PICTURE,//可选媒体类型：圖片=0，只允许选择图片將返回指定DestinationType的参数。 視頻格式=1，允许选择视频，最终返回 FILE_URI。ALLMEDIA= 2，允许所有媒体类型的选择。
        allowEdit: false,//在选择之前允许修改截图
        correctOrientation: true,//有可能会出现base64上传后图片自动旋转90度的问题,correctOrientation设置true即可
        saveToPhotoAlbum: false                                   //保存进手机相册
      }
      return options;
    }

    storeImage(sourceType,certificatesType) {
      let options = this.setOptions(sourceType);
      let currentName: string = null;
      let currentPath: string = null;
        if (this.platform.is('android') && sourceType === Camera.PictureSourceType.PHOTOLIBRARY) {
          //相册
          Camera.getPicture(options).then(imagePath => {
            return imagePath;
          }).then(value => {
            currentName = value.substring(value.lastIndexOf('/') + 1, value.lastIndexOf('?'));
            return FilePath.resolveNativePath(value);
          }).then(filePath => {
            currentPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            return  this.convertImageAsBase64(currentPath, currentName);
          }).then(imageString => {
            if(certificatesType == 'certificates'){
              this.certificates = imageString;
            }
            if(certificatesType == 'certifiedPhoto'){
              this.certifiedPhoto = imageString;
            }
          });
        } else{
          //拍照
          Camera.getPicture(options).then(imagePath => {
            return imagePath;
          }).then(value => {
            currentName = value.substr(value.lastIndexOf('/') + 1);
            currentPath = value.substr(0, value.lastIndexOf('/') + 1);
            console.log('CurrentName, CurrentPath: ', currentName, currentPath);
            return this.convertImageAsBase64(currentPath, currentName);
          }).then(imageString => {
            if(certificatesType == 'certificates'){
              this.certificates = imageString;
            }
            if(certificatesType == 'certifiedPhoto'){
              this.certifiedPhoto = imageString;
            }
          });
        }
    }
    private convertImageAsBase64(filePath, fileName) {
      return File.readAsDataURL(filePath, fileName);
    }


    submitUpload(){
      if (this.certificates  == this.defaultPhoto) {
        this.helperService.presentToast('身份证照片必传');
        return false;
      }
      if (this.certifiedPhoto  == this.defaultPhoto) {
        this.helperService.presentToast('持证照片必传');
        return false;
      }
      if (this.receiveAccount  == "") {
        this.helperService.presentToast('收账账号必填');
        return false;
      }
      this.isClick = 'disabled';
      this.http.post(this.deliveryBoyUrl,
        {certificates:this.certificates,
        certificateType:"ID",
        certifiedPhoto:this.certifiedPhoto,
        receiveAccount:this.receiveAccount,
        receiveAccountType:this.receiveAccountType
      },this.helperService.getOptions())
      .subscribe((data)=> {
          let result = data.json();
          if (result.code == '200') {
            this.helperService.presentToast('提交认证成功，请等待审核');
            this.nav.push(Person);
          }
        },
        (err)=> {
          this.isClick = '';
          this.helperService.presentToast('网络请求失败,请确保你的网络环境正常');
        });
    }

}
