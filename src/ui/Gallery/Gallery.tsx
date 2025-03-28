import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import "./Gallery.css";
import FullscreenSlider from "../FullscreenSlider/FullscreenSlider.tsx";
import DeletePicture from "../../assets/swiper/delete.svg";
import Button from "../Button/Button.tsx";
import ConfirmModal from "../ConfirmModal/ConfirmModal.tsx";

interface GalleryProps {
  photos: File[];
  onClose: () => void;
  onDelete: (updatedPhotos: File[]) => void;
  isDeletable?: boolean;
}

const Gallery: React.FC<GalleryProps> = ({
  photos,
  onClose,
  onDelete,
  isDeletable = true,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [currentPhotos, setCurrentPhotos] = useState<File[]>(photos);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleDeleteImage = (index: number) => {
    if (document.querySelector('.react-confirm-alert')) {
      return;
    }
    
    ConfirmModal({
      title: "Удаление фото",
      message: "Вы уверены, что хотите удалить это фото?",
      onConfirm: () => {
        const updatedPhotos = currentPhotos.filter((_, i) => i !== index);
        setCurrentPhotos(updatedPhotos);
        onDelete(updatedPhotos);
      },
      onCancel: () => {},
    });

  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      className="modal-content"
      overlayClassName="modal-overlay"
      ariaHideApp={false}
    >
      {selectedPhoto === null ? (
        <div className="modal-gallery">
          {photos.map((file, index) => (
            <div key={index} className="gallery-item">
              <img
                src={URL.createObjectURL(file)}
                alt={`Фото ${index + 1}`}
                className="gallery-img"
                onClick={() => setSelectedPhoto(index)}
              />
              {isDeletable ? (
                <button
                  type="button"
                  className="gallery__delete"
                  onClick={() => handleDeleteImage(index)}
                >
                  <img src={DeletePicture} alt="Картинка удаления" />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <FullscreenSlider
          photos={photos}
          initialSlide={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}

      <Button
        type="button"
        text="Вернуться назад"
        className="link gallery__btn"
        onClick={onClose}
      />
    </Modal>
  );
};

export default Gallery;
