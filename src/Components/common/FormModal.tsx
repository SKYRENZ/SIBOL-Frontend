import React, { ReactNode, useState } from "react";
import { X } from "lucide-react";
import { format, parse } from "date-fns";

import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/Components/ui/popover";
import { Calendar } from "@/Components/ui/calendar";


interface FormField {
  type: string;
  name: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  options?: { label: string; value: string }[];
}

interface FormSchema {
  fields: FormField[];
  onSubmit?: (data: Record<string, any>) => void;
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  width?: string;
  schema?: FormSchema;
  children?: ReactNode;
}

/* ============================================================
   FORM RENDERER
============================================================ */

const FormRenderer = ({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: any;
  onChange: (name: string, value: any) => void;
}) => {
  switch (field.type) {
    case "text":
      return (
        <Input
          value={value || ""}
          disabled={field.disabled}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.name, e.target.value)}
          className="border-green-700 text-green-800"
        />
      );

    case "textarea":
      return (
        <Textarea
          rows={field.rows || 3}
          value={value || ""}
          disabled={field.disabled}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.name, e.target.value)}
          className="border-green-700 text-green-800"
        />
      );

    case "select":
      return (
        <Select
          value={value || ""}
          onValueChange={(val) => onChange(field.name, val)}
        >
          <SelectTrigger className="border-green-700 text-green-800 w-full">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "date":
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full justify-start border-green-700 text-green-800 hover:bg-green-100`}
            >
              {value
                ? (() => {
                    const d = parse(value, "yyyy-MM-dd", new Date());
                    d.setHours(12, 0, 0, 0); // force local midday to avoid TZ shifts
                    return format(d, "PPP");
                  })()
                : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[1000002]">
            <Calendar
              mode="single"
              selected={
                value
                  ? (() => {
                      const d = parse(value, "yyyy-MM-dd", new Date());
                      d.setHours(12, 0, 0, 0);
                      return d;
                    })()
                  : undefined
              }
              onSelect={(date) => {
                if (!date) return onChange(field.name, undefined);

                // store as local yyyy-MM-dd (avoid timezone/ISO issues)
                const local = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
                const yyyy = local.getFullYear();
                const mm = String(local.getMonth() + 1).padStart(2, "0");
                const dd = String(local.getDate()).padStart(2, "0");
                onChange(field.name, `${yyyy}-${mm}-${dd}`);
              }}
            />
          </PopoverContent>
        </Popover>
      );

    default:
      return (
        <div className="text-red-500 text-sm">
          Unsupported field type: {field.type}
        </div>
      );
  }
};

/* ============================================================
   FORM MODAL
============================================================ */

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  schema,
  children,
  width = "600px",
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    schema?.onSubmit?.(formData);
  };

  if (!isOpen) return null;

  return (
    <div
      className="flex items-center justify-center p-4"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        zIndex: 999999,
      }}
    >
      <div
        className="relative bg-white rounded-lg shadow-2xl w-full mx-auto p-6 border border-gray-200 max-h-[90vh] overflow-y-auto"
        style={{ maxWidth: width, zIndex: 1000000 }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-transparent rounded-md p-1 text-green-900 hover:text-green-700 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {icon && <div className="text-green-800">{icon}</div>}
          <div>
            <h2 className="text-lg font-semibold text-green-800">{title}</h2>
            {subtitle && (
              <p className="text-gray-600 text-sm mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        <hr className="border-gray-200 mb-4" />

        {/* Render dynamic form */}
        {schema ? (
          <div className="grid grid-cols-2 gap-4">
            {schema.fields.map((field) => (
              <div key={field.name} className="flex flex-col">
                {field.label && (
                  <label className="text-sm text-gray-700 mb-1">
                    {field.label}
                  </label>
                )}

                <FormRenderer
                  field={field}
                  value={formData[field.name]}
                  onChange={handleChange}
                />
              </div>
            ))}

            {/* Submit Button */}
            <div className="col-span-2 mt-4">
              <Button
                onClick={handleSubmit}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-2 rounded-md transition"
              >
                Submit
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 bg-white">{children}</div>
        )}
      </div>
    </div>
  );
};

export default FormModal;
