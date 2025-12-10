"use client";

import * as React from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";

import "react-day-picker/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={cn("p-3", className)}
      style={{
        "--rdp-accent-color": "#355842",
        "--rdp-accent-background-color": "#D9EBD9",
        "--rdp-day-height": "36px",
        "--rdp-day-width": "36px",
        "--rdp-selected-font": "bold",
      } as React.CSSProperties}
      components={{
        Chevron: ({ orientation }) => {
          return orientation === "left" ? (
            <ChevronLeft className="h-4 w-4 text-[#2E523A]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[#2E523A]" />
          );
        },
      }}
      modifiersStyles={{
        selected: {
          backgroundColor: "#355842",
          color: "white",
          borderRadius: "6px",
        },
        today: {
          backgroundColor: "#D9EBD9",
          color: "#2E523A",
          fontWeight: "600",
          borderRadius: "6px",
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

interface DatePickerProps {
  value?: string;
  onChange?: (e: { target: { name: string; value: string } }) => void;
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

const DatePicker = ({
  value,
  onChange,
  name,
  label,
  placeholder = "Pick a date",
  required,
  className,
  disabled,
}: DatePickerProps) => {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  React.useEffect(() => {
    if (value) {
      setDate(new Date(value));
    } else {
      setDate(undefined);
    }
  }, [value]);

  const handleSelect = (newDate: Date | undefined) => {
    if (disabled) return;
    setDate(newDate);
    if (onChange && name) {
      onChange({
        target: {
          name: name,
          value: newDate ? format(newDate, "yyyy-MM-dd") : "",
        },
      });
    }
  };

  return (
    <div className={cn("flex flex-col gap-1.5 sm:gap-2", className)}>
      {label && (
        <label className="text-xs sm:text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal bg-white border-gray-300 shadow-none hover:bg-gray-50 text-gray-900",
              !date && "text-gray-500",
              disabled && "opacity-50 cursor-not-allowed bg-gray-50"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-[#2E523A]" />
            {date ? format(date, "MMMM do, yyyy") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 z-[200002] bg-white border border-gray-200 shadow-xl rounded-xl"
          align="start"
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export { Calendar };
export default DatePicker;