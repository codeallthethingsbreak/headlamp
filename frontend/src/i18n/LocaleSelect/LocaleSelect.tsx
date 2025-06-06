/*
 * Copyright 2025 The Kubernetes Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import FormControl, { FormControlProps } from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../config';

export interface LocaleSelectProps {
  /** Whether to show the title label above the select dropdown. */
  showTitle?: boolean;
  /** Whether to display full names of languages instead of their language codes. */
  showFullNames?: boolean;
  /** Additional props to pass to the underlying Material-UI `FormControl` component. */
  formControlProps?: FormControlProps;
}

/**
 * A UI for selecting the locale with i18next
 */
export default function LocaleSelect(props: LocaleSelectProps) {
  const { formControlProps, showFullNames } = props;
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  /**
   * Returns a memoized mapping of language codes to their full names if showFullNames is true.
   *
   * @returns An object where keys are language codes and values are full names, or an empty object if showFullNames is false.
   */
  const fullNames = React.useMemo(() => {
    if (!showFullNames) {
      return {};
    }

    return getFullNames();
  }, [showFullNames]);

  /**
   * Handles the change in language selection.
   *
   * @param event - The event triggered by selecting a new language from the dropdown.
   */
  const changeLng = (event: SelectChangeEvent<string>) => {
    const lng = event.target.value as string;

    i18n.changeLanguage(lng);
    theme.direction = i18n.dir();
  };

  /**
   * Retrieves full language names for supported languages from the i18next configuration.
   *
   * @returns An object mapping language codes to their full names.
   */
  function getFullNames() {
    if (!i18n?.options?.supportedLngs) {
      return {};
    }

    const fullNames: { [langCore: string]: string } = {};
    i18n?.options?.supportedLngs.forEach((lng: string) => {
      if (!lng) {
        return;
      }

      fullNames[lng] = supportedLanguages[lng] || lng;
    });

    return fullNames;
  }

  // Select has a problem with aria-controls not being stable under test.
  const extraInputProps = import.meta.env.UNDER_TEST ? { 'aria-controls': 'under-test' } : {};

  return (
    <FormControl {...formControlProps}>
      {props.showTitle && <FormLabel component="legend">{t('Select locale')}</FormLabel>}
      <Select
        value={i18n.language ? i18n.language : 'en'}
        onChange={changeLng}
        size="small"
        variant="outlined"
        SelectDisplayProps={extraInputProps}
        inputProps={{ 'aria-label': t('Select locale'), ...extraInputProps }}
      >
        {(i18n?.options?.supportedLngs || [])
          .filter(lng => lng !== 'cimode')
          .map(lng => (
            <MenuItem value={lng} key={lng}>
              {showFullNames ? fullNames[lng] : lng}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
}
