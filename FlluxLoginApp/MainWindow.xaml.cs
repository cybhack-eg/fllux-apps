using System;
using System.Windows;
using Microsoft.Web.WebView2.Core;

namespace FlluxLoginApp;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        Loaded += OnLoaded;
    }

    private async void OnLoaded(object? sender, RoutedEventArgs e)
    {
        if (WebView.CoreWebView2 == null)
        {
            var env = await CoreWebView2Environment.CreateAsync();
            await WebView.EnsureCoreWebView2Async(env);
        }

        WebView.Source = new Uri("https://fllux.org/login");
    }
}
