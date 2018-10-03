//
//  AppDelegate.swift
//  viewer
//
//  Created by Godfrey Chan on 9/30/18.
//  Copyright © 2018 reactions.live. All rights reserved.
//

import Cocoa
import WebKit

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate {
    @IBOutlet var window: NSPanel!
    @IBOutlet var webkitView: WKWebView!

    func applicationDidFinishLaunching(_ notification: Notification) {
        window.styleMask = .init(rawValue: NSWindow.StyleMask.borderless.rawValue | NSWindow.StyleMask.nonactivatingPanel.rawValue)
        window.level = .mainMenu
        window.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]
        window.setFrame(NSScreen.main!.frame, display: true)
        window.ignoresMouseEvents = true
        window.backgroundColor = NSColor.clear
        window.isOpaque = false

        webkitView.setValue(false, forKey: "drawsBackground")
        
#if DEBUG
        webkitView.load(URLRequest(url: URL(string: "http://localhost:4200/viewer/")!))
#else
        webkitView.load(URLRequest(url: URL(string: "https://reactions.live/viewer/")!))
#endif
    }
}

