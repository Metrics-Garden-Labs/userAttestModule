export function mapPrefixRegex(parameters: any): any {
  if (!parameters || !parameters.values) {
    throw new Error("Parameters must have a values property.");
  }

  const mappedValues = parameters.values.map(
    (v: { parts: { is_public: boolean; regex_def: string }[] }) => {
      const prefixRegex = getPrefixRegex(v.parts);
      return {
        ...v,
        prefixRegex,
      };
    }
  );

  return {
    ...parameters,
    values: mappedValues,
  };
}

export function getPrefixRegex(
  parts: { is_public: boolean; regex_def: string }[]
): string {
  if (!parts || parts.length === 0) {
    throw new Error("Parts array cannot be empty.");
  }

  let prefixRegex = "";
  for (let part of parts) {
    if (!part.is_public) {
      prefixRegex += part.regex_def;
    } else {
      break;
    }
  }

  if (!prefixRegex) {
    throw new Error(
      "Part has to have start with a regex that is_public = false in order to find it later"
    );
  }

  return JSON.stringify(prefixRegex);
}

export function calculateSignalLength(values: { maxLength: number }[] = []) {
  if (!values || values.length === 0) {
    return 1; // Default signal length when no values are provided
  }

  return values.reduce(
    (acc, value) =>
      acc + Math.floor(value.maxLength / 31) + (value.maxLength % 31 ? 1 : 0),
    1
  );
}
