export const INITIAL_RESULT_COUNT = 4;

export const QUESTION_MAP = {
  q1: "Experience", q2: "Gaming", q3: "Modern", q4: "Options",
  q5: "Keyboard", q6: "Pretty", q7: "Ins_Complex", q8: "PM_Terminal",
  q9: "Privacy", q10: "Hard_Freedom", q11: "Adventure",
  q12: "Upd_Regular", q13: "Nvidia"
};

export const REVERSE_MAP = Object.fromEntries(
  Object.entries(QUESTION_MAP).map(([k, v]) => [v, k])
);