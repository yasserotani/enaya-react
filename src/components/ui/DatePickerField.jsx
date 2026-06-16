import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

export default function DatePickerField({ value, onChange, error }) {
  return (
    <DatePicker
      value={value ? dayjs(value) : null}
      onChange={(date) => onChange(date ? date.format("YYYY-MM-DD") : "")}
      maxDate={dayjs().subtract(1, "day")}
      slotProps={{
        textField: {
          fullWidth: true,
          error: Boolean(error),
          placeholder: "Select date of birth",
          sx: {
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: "var(--theme-background)",
              color: "var(--theme-foreground)",
              "& fieldset": { borderColor: "var(--theme-border)" },
              "&:hover fieldset": { borderColor: "var(--theme-primary)" },
              "&.Mui-focused fieldset": {
                borderColor: "var(--theme-primary)",
                borderWidth: "1px",
                boxShadow: "0 0 0 4px color-mix(in srgb, var(--theme-primary) 15%, transparent)",
              },
            },
            "& .MuiPickersSectionList-root": {
              color: "var(--theme-foreground)",
              padding: "10px 16px",
              fontSize: "0.875rem",
            },
            "& .MuiPickersSectionList-sectionContent": {
              color: "var(--theme-foreground)",
            },
            "& .MuiPickersSectionList-sectionSeparator": {
              color: "var(--theme-foreground)",
            },
            "& .MuiSvgIcon-root": {
              color: "var(--theme-foreground)",
              opacity: 0.6,
            },
          },
        },
        popper: {
          sx: { zIndex: 1600 },
        },
      }}
    />
  );
}