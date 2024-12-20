import React, { useEffect, useState } from "react";
import { Button, Input, Radio, Modal } from "antd";
import { Controller, useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";
import {
  actDeleteTaskById,
  actCreateNewTask,
  actUpdateTask,
} from "../../redux/features/tasks/taskSlice";
import { useNavigate } from "react-router-dom";
import { TASK_STATUS } from "../../constants/task.constants";
import { AppDispatch } from "../../redux/store";
import { v4 as uuidv4 } from "uuid";
import "./styles.scss";

const schema = Yup.object().shape({
  title: Yup.string().required("Please input title"),
  creator: Yup.string().required("Please input creator"),
  status: Yup.string()
    .oneOf(["NEW", "DOING", "DONE"] as const)
    .required("Status is required"),
  description: Yup.string().required("Please input description"),
  createdat: Yup.date().required("Created at is required"),
});

interface TaskFormData {
  title: string;
  creator: string;
  status: "NEW" | "DOING" | "DONE";
  description: string;
  createdat: Date;
}

const TaskForm: React.FC<{ isEdit?: boolean; currentTask?: any }> = ({
  isEdit = false,
  currentTask,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const methods = useForm<TaskFormData>({
    defaultValues: {
      title: "",
      creator: "",
      createdat: new Date(),
      status: TASK_STATUS.NEW,
      description: "",
    },
    resolver: yupResolver(schema),
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = methods;

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const onValid = (formValue: TaskFormData) => {
    const task = {
      ...formValue,
      id: isEdit ? currentTask?.id || uuidv4() : uuidv4(),
    };
    if (isEdit) {
      if (task.id) {
        dispatch(actUpdateTask(task));
      }
    } else {
      dispatch(actCreateNewTask(task));
    }
    navigate("/all-task");
  };

  const handleDeleteTask = () => {
    if (currentTask?.id) {
      Modal.confirm({
        title: "Are you sure you want to delete this task?",
        onOk: () => {
          dispatch(actDeleteTaskById(currentTask.id));
          navigate("/all-task");
        },
      });
    }
  };

  useEffect(() => {
    if (isEdit && currentTask) {
      reset({
        ...currentTask,
        status: currentTask.status as "NEW" | "DOING" | "DONE",
        createdat: currentTask.createdat || new Date(),
      });
      setIsEditing(true);
    }
  }, [isEdit, currentTask, reset]);

  return (
    <div className="form-container">
      <form className="form" onSubmit={handleSubmit(onValid)}>
        <h2>{isEdit ? "Edit Task" : "Create New Task"}</h2>

        <Controller
          name="title"
          control={control}
          render={({ field }) => <Input {...field} placeholder="Title" />}
        />
        {errors.title && (
          <p className="error-message">{errors.title?.message}</p>
        )}

        <Controller
          name="creator"
          control={control}
          render={({ field }) => <Input {...field} placeholder="Creator" />}
        />
        {errors.creator && (
          <p className="error-message">{errors.creator?.message}</p>
        )}

        {isEditing && (
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Radio.Group {...field} className="radio-group">
                <Radio value="NEW">New</Radio>
                <Radio value="DOING">Doing</Radio>
                <Radio value="DONE">Done</Radio>
              </Radio.Group>
            )}
          />
        )}
        {errors.status && (
          <p className="error-message">{errors.status?.message}</p>
        )}

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Input.TextArea {...field} placeholder="Description" />
          )}
        />
        {errors.description && (
          <p className="error-message">{errors.description?.message}</p>
        )}

        <Controller
          name="createdat"
          control={control}
          render={({ field }) => {
            const value = field.value ? new Date(field.value) : new Date();
            return (
              <Input
                {...field}
                type="date"
                value={value.toISOString().split("T")[0]}
              />
            );
          }}
        />
        {errors.createdat && (
          <p className="error-message">{errors.createdat?.message}</p>
        )}

        <Button type="primary" htmlType="submit">
          {isEdit ? "Update" : "Save"}
        </Button>
        <Button type="default" onClick={() => reset()}>
          Reset
        </Button>
        {isEdit && currentTask && (
          <Button
            style={{ backgroundColor: "red", color: "white" }}
            onClick={handleDeleteTask}
          >
            Delete
          </Button>
        )}
      </form>
    </div>
  );
};

export default TaskForm;
