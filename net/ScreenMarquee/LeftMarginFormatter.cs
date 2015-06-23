﻿using System;
using System.Globalization;
using System.Windows;
using System.Windows.Data;

namespace ScreenMarquee
{
    public class LeftMarginFormatter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return new Thickness((double) value, 0, 0, 0);
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}
