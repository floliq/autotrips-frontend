import { observer } from "mobx-react";
import "./CarAcceptanceData.css";
import Button from "../../ui/Button/Button";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import getTodayDate from "../../utils/getTodayDate";
import Select from "../../ui/Select/Select";
import FileUploader from "../../ui/FileUploader/FileUploader";
import InputField from "../../ui/Input/Input";
import ReportsService from "../../services/ReportsService";
import { AcceptanceData } from "../../@types/AcceptanceData";
import { useEffect, useState } from "react";
import reportsStore from "../../store/ReportsStore";
import ConfirmModal from "../../ui/ConfirmModal/ConfirmModal";
import MessageBox from "../../ui/MessageBox/MessageBox";
import ComparisonsData from "../ComparisonsData/ComparisonsData";

const schema = z.object({
  vin: z.string().min(1, "VIN номер обязателен"),
  carPhotos: z
    .array(z.instanceof(File))
    .min(1, "Загрузите хотя бы одно фото")
    .refine(
      (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
      "Каждый файл должен быть меньше 5MB"
    )
    .refine(
      (files) =>
        files.every((file) =>
          ["image/jpeg", "image/png", "image/gif"].includes(file.type)
        ),
      "Поддерживаются только форматы JPEG, PNG и GIF"
    ),
  keyPhotos: z
    .array(z.instanceof(File))
    .min(1, "Загрузите хотя бы одно фото")
    .refine(
      (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
      "Каждый файл должен быть меньше 5MB"
    )
    .refine(
      (files) =>
        files.every((file) =>
          ["image/jpeg", "image/png", "image/gif"].includes(file.type)
        ),
      "Поддерживаются только форматы JPEG, PNG и GIF"
    ),
  docsPhotos: z
    .array(z.instanceof(File))
    .min(1, "Загрузите хотя бы одно фото")
    .refine(
      (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
      "Каждый файл должен быть меньше 5MB"
    )
    .refine(
      (files) =>
        files.every((file) =>
          ["image/jpeg", "image/png", "image/gif"].includes(file.type)
        ),
      "Поддерживаются только форматы JPEG, PNG и GIF"
    ),
  place: z.string().min(1, "Расположение авто обязательно"),
  notes: z.string().optional(),
});

type CarAcceptanceFormData = z.infer<typeof schema>;

const CarAcceptanceData = () => {
  const [uploaderKey, setUploaderKey] = useState(0);
  const [showComparison, setShowComparison] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CarAcceptanceFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      carPhotos: [],
      keyPhotos: [],
      docsPhotos: [],
      notes: "",
    },
  });

  useEffect(() => {
    reportsStore.fetchCars();
  }, []);

  const selectedVin = watch("vin");

  const resetForm = () => {
    reset({
      carPhotos: [],
      keyPhotos: [],
      docsPhotos: [],
      notes: "",
      place: "",
      vin: "",
    });
    setUploaderKey((prev) => prev + 1);
  };

  const getCarModel = () => {
    return selectedVin && reportsStore.vins[selectedVin]
      ? reportsStore.vins[selectedVin]
      : "";
  };

  const handleFileChange = (
    files: FileList,
    fieldName: "carPhotos" | "keyPhotos" | "docsPhotos"
  ) => {
    const fileArray = Array.from(files);

    const currentFiles = control._formValues[fieldName] || [];
    const updatedFiles = [...currentFiles, ...fileArray];

    console.log(
      `Загружено ${fileArray.length} файла(ов) для поля ${fieldName}`
    );
    console.log(`Всего файлов в поле ${fieldName}: ${updatedFiles.length}`);
    setValue(fieldName, updatedFiles, { shouldValidate: true });
  };

  const handleDeleteFiles = (
    updatedFiles: File[],
    fieldName: "carPhotos" | "keyPhotos" | "docsPhotos"
  ) => {
    setValue(fieldName, updatedFiles, { shouldValidate: true });
  };

  const handleAcceptCar = async (data: CarAcceptanceFormData) => {
    const submissionData: AcceptanceData = {
      vin: data.vin,
      model: getCarModel(),
      carPhotos: data.carPhotos,
      keyPhotos: data.keyPhotos,
      docsPhotos: data.docsPhotos,
      place: data.place,
      notes: data.notes || "",
      status: "Принят",
    };

    await ReportsService.addReport(submissionData);

    MessageBox({
      title: "Успешно",
      message: "Операция выполнена успешно",
      onClose: () => {},
      buttonText: "ОК",
    });
    resetForm();
  };

  const handleDamagedCar = async (data: CarAcceptanceFormData) => {
    const submissionData: AcceptanceData = {
      vin: data.vin,
      model: getCarModel(),
      carPhotos: data.carPhotos,
      keyPhotos: data.keyPhotos,
      docsPhotos: data.docsPhotos,
      place: data.place,
      notes: data.notes || "",
      status: "Повреждён",
    };

    await ReportsService.addReport(submissionData);

    MessageBox({
      title: "Успешно",
      message: "Операция выполнена успешно. Запрос отправлен в тех поддержку",
      onClose: () => {},
      buttonText: "ОК",
    });
    resetForm();
  };

  const onAcceptCarSubmit = (data: CarAcceptanceFormData) => {
    ConfirmModal({
      title: "Подтверждение",
      message: "Вы уверены, что хотите принять автомобиль?",
      onConfirm: () => handleAcceptCar(data),
      onCancel: () => console.log("Принятие отменено"),
    });
  };

  const onDamagedCarSubmit = (data: CarAcceptanceFormData) => {
    ConfirmModal({
      title: "Подтверждение",
      message:
        "Вы уверены, что хотите отметить автомобиль как повреждённый? Это отправит запрос в тех. поддержку.",
      onConfirm: () => handleDamagedCar(data),
      onCancel: () => console.log("Отмена действия"),
    });
  };

  if (showComparison) {
    return (
      <ComparisonsData 
        onBack={() => setShowComparison(false)} 
        initialVin={selectedVin}
      />
    );
  }

  return (
    <div className="acceptance__form">
      <form>
        <p className="input acceptance__date">
          Дата принятия: {getTodayDate()}
        </p>
        <Select
          name="vin"
          control={control}
          options={reportsStore.vinOptions}
          placeholder="VIN номер"
          error={errors.vin}
        />

        <p className="acceptance__text">
          Марка: <span className="acceptance__text-model">{getCarModel()}</span>
        </p>
        <Button
          type="button"
          text="Сравнить модель"
          className="link acceptance__comparison"
          disabled={!selectedVin}
          onClick={() => setShowComparison(true)}
        />

        <div className="group">
          <label className="label">
            Фото автомобиля (экстерьер/интерьер){" "}
            <span className="label-required">*</span>
          </label>
          <Controller
            name="carPhotos"
            control={control}
            render={({ field }) => (
              <FileUploader
                key={`carPhotos-${uploaderKey}`}
                onFilesSelected={(files) => {
                  handleFileChange(files, "carPhotos");
                  field.onChange(control._formValues.carPhotos);
                }}
                onDelete={(updatedFiles) =>
                  handleDeleteFiles(updatedFiles, "carPhotos")
                }
              />
            )}
          />
          {errors.carPhotos && (
            <span className="error error-photos">
              {errors.carPhotos.message}
            </span>
          )}
        </div>

        <div className="group">
          <label className="label">
            Фото ключа <span className="label-required">*</span>
          </label>
          <Controller
            name="keyPhotos"
            control={control}
            render={({ field }) => (
              <FileUploader
                key={`keyPhotos-${uploaderKey}`}
                onFilesSelected={(files) => {
                  handleFileChange(files, "keyPhotos");
                  field.onChange(control._formValues.keyPhotos);
                }}
                onDelete={(updatedFiles) =>
                  handleDeleteFiles(updatedFiles, "keyPhotos")
                }
              />
            )}
          />
          {errors.keyPhotos && (
            <span className="error error-photos">
              {errors.keyPhotos.message}
            </span>
          )}
        </div>

        <div className="group">
          <label className="label">
            Фото документов <span className="label-required">*</span>
          </label>
          <Controller
            name="docsPhotos"
            control={control}
            render={({ field }) => (
              <FileUploader
                key={`docsPhotos-${uploaderKey}`}
                onFilesSelected={(files) => {
                  handleFileChange(files, "docsPhotos");
                  field.onChange(control._formValues.docsPhotos);
                }}
                onDelete={(updatedFiles) =>
                  handleDeleteFiles(updatedFiles, "docsPhotos")
                }
              />
            )}
          />
          {errors.docsPhotos && (
            <span className="error error-photos">
              {errors.docsPhotos.message}
            </span>
          )}
        </div>

        <InputField
          type="text"
          placeholder="Где находится авто"
          name="place"
          register={register}
          error={errors.place}
          className="input"
        />

        <InputField
          type="text"
          placeholder="Комментарий"
          name="notes"
          register={register}
          error={errors.notes}
          className="input acceptance__notes"
        />

        <div className="acceptance__btns">
          <Button
            type="button"
            text="Принять авто"
            className="link acceptance__btn"
            onClick={handleSubmit(onAcceptCarSubmit)}
          />
          <div className="acceptance__damaged acceptance__btn">
            <Button
              type="button"
              text="Повреждено"
              className="link warning"
              onClick={handleSubmit(onDamagedCarSubmit)}
            />
            <span className="acceptance__warning">
              *Отправим запрос в тех. поддержку
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default observer(CarAcceptanceData);
