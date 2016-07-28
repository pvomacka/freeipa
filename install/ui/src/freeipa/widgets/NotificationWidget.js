/*  Authors:
 *    Pavel Vomacka <pvomacka@redhat.com>
 *
 * Copyright (C) 2016 Red Hat
 * see file 'COPYING' for use and warranty information
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

define(['dojo/_base/declare',
        'dojo/dom-construct',
        'dojo/on',
        'dojo/query',
        './NotificationItemWidget',
        '../jquery'], function(declare, construct, on, query,
             NotificationItemWidget, $) {

    return declare([], {

        /**
         *
         *
         * @class widgets.NotificationItemWidget
         */

        el_type: 'li',

        /**
         *
         *
         *
         */
        name: 'notification-centre',

        class: 'notifications',

        /**
         * List of notifications
         *
         * @property {Array[Notification]}
         */
        items: [],

        unread: 0,

        render: function(parent_node) {
            if (this.dom_node) {
                construct.empty(this.dom_node);
            } else {
                this.dom_node = construct.create(this.el_type, {
                    name: this.name || '',
                    'class': this['class']
                });
            }

            this._render_icon(this.dom_node);
            this._render_notification_centre(parent_node);

            this._register_listeners();

            this.add_notification();
            return this.dom_node;
        },

        _render_icon: function(node) {
            this.link = construct.create('a', {
                name: 'notification-link',
                'class': 'nav-item-iconic drawer-pf-trigger-icon'
            });

            var icon = construct.create('span', {
                name: 'notification-icon',
                title: 'Notifications',
                'class': 'fa fa-bell'
            });

            construct.place(icon, this.link);
            construct.place(this.link, node);
        },

        _render_notification_area: function(node) {
            var notif_container = construct.create('div', {
                'class': 'panel-group',
                style: 'overflow-y: hidden',
                id: 'notification-drawer-accordion'
            });

            var notif_panel = construct.create('div', {
                'class': 'panel panel-default',
            });

            this.notification_container = construct.create('div', {
                'class': 'panel-body',
                style: 'padding: 0' //workaround
            });

            // construct notification area
            construct.place(notif_container, node);
            construct.place(notif_panel, notif_container);
            construct.place(this.notification_container, notif_panel);
        },

        _render_notification_centre: function(node) {
            var container = construct.create('div', {
                name: 'notification-container',
                'class': 'drawer-pf hide drawer-pf-notifications-non-clickable'
            });

            var title_container = construct.create('div', {
                name: 'notification-container',
                'class': 'drawer-pf-title'
            });

            var title = construct.create('h3', {
                name: 'notification-title',
                'class': 'text-center',
                innerHTML: 'Notification Center'
            });

            // construct title bar
            construct.place(title, title_container);
            construct.place(title_container, container);
            construct.place(container, node);

            // render notification area
            this._render_notification_area(container);
        },



        /**
         * Code is already implemented on patternfly website
         * http://www.patternfly.org/pattern-library/communication/notification-drawer/#/code
         *
         */
        _register_listeners: function() {
            // TODO: implement Show/Hide Notifications Drawer

            // TODO implement marking as read
        },

        _decrease_unread: function() {
            console.log('dec');
            //decrease number of unread notifications
        },

        _increase_undead: function() {
            console.log("inc");
            // increase number of unread notifications
        },

        add_notification: function(spec) {
            spec = spec || {
                name: 'test',
                type: 'warning',
                text: 'TestWarning'
            }; // temporary spec for testing purposes

            //extend spec

            var callbacks = {
                unr_inc: this._increase_undead,
                unr_dec: this._decrease_unread
            };

            var notif_item =  new NotificationItemWidget(spec);
            notif_item.render(this.notification_container);
            on(notif_item, 'read', this.decrease_unread);
            on(notif_item, 'unread', this.increase_unread);

        },

        _set_all_read: function() {

        },


        constructor: function(spec) {
            declare.safeMixin(this, spec);
        }

    });
});
