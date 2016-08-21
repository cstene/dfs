(function () {
    "use strict";

    angular
        .module("app")
        .service("photoService", PhotoService);

    /**
     * Provides access to the application's configuration settings.
     * @constructor
     */
    function PhotoService($q, cyanBootstrapUi, cyanNative, cyanDateTimeService, stringHelpers) {
        "ngInject";
        var service = this;

        Object.assign(service, {
            addPhoto: addPhoto,
            uploadPhoto: uploadPhoto
        });

        function uploadPhoto(fileUri) {
            return cyanNative.saveFileUploadTransaction(stringHelpers.fileUriToFilePath(fileUri));
        }

        function addPhoto(options) {
            /*camera options             
             * caption = caption of dialog popup.
             * message = message of dialog popup.
             */
            var promise = $q.defer(),
                filePath;

            cyanBootstrapUi.promptCameraAlbum(options.caption, options.message)
            .then(function (dialogResult) {
                /*This does nothing, needs to be fixed in ng-boostrap.
                if (dialogResult.isCancelled) {
                    return null;
                }*/

                if (dialogResult.isCamera) {
                    //Bug in cordova on android devices, must pass saveToPhotoAlbum as false for camera to work.
                    return cyanNative.getImageFromCamera({ saveToPhotoAlbum: false });
                } else {
                    return cyanNative.getImageFromSavedPhotoAlbum();
                }
            })
            .then(function (fileUri) {
                if (fileUri) {
                    return cyanNative.copyFileToDefaultFileStorage({ filePath: fileUri });
                }
                return null;
            })
            .then(function (fileUri) {
                if (fileUri) {
                    filePath = fileUri;
                    return cyanNative.getImageDetails(filePath);
                }

                return null;
            })
            .then(function (fileDetails) {
                if (fileDetails) {
                    Object.assign(fileDetails, {
                        fileUri: filePath,
                        created: cyanDateTimeService.getUtcDateTime(),
                        fileName: filePath.substring(filePath.lastIndexOf('/') + 1),
                        fileSizeKb: fileDetails.fileSize / 1000
                    });
                }

                promise.resolve(fileDetails);
            })
            .catch(function (e) {
                if (!e || e === 'Selection cancelled.' || e === 'Camera cancelled.') {
                    promise.resolve();
                }
                promise.reject(e);
            });

            return promise.promise;
        }
    }
})();