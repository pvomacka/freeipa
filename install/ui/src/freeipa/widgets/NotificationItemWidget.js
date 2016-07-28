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
        'dojo/dom-class',
        'dojo/dom-construct',
        'dojo/Evented',
        'dojo/_base/lang',
        'dojo/on',
        'dojo/Stateful'], function(declare, domClass, construct, Evented, lang,
            on, Stateful) {

    return declare([Stateful, Evented], {

        /**
         *
         *
         * @class widgets.NotificationItem
         */


        /**
         *
         *
         *
         */
        name: '',

        type: 'info',

        /**
         *
         *
         */
        class: 'notification',

        /**
         * List of notifications
         *
         * @property {Array[Notification]}
         */
        text: 'Default notification',

        date: 'testDate',

        time: 'testTime',

        render: function(parent_node) {
            this.container = construct.create('div', {
                'class': 'drawer-pf-notification unread'
            });

            var icon = construct.create('span', {
                'class': 'pficon pficon-ok pull-left',
                innerHTML: 'x' //TODO: add PF icon
            });

            var content_container = construct.create('div', {
                'class': 'drawer-pf-notification-content'
            });

            var notification_mgs = construct.create('span', {
                'class': 'drawer-pf-notification-message',
                innerHTML: this.text
            });

            var notification_data_container = construct.create('div', {
                'class': 'drawer-pf-notification-info'
            });

            var notification_date = construct.create('span', {
                'class': 'date',
                innerHTML: this.date
            });

            var notification_time = construct.create('span', {
                'class': 'time',
                innerHTML: this.time
            });

            construct.place(this.container, parent_node);
            construct.place(icon, this.container);
            construct.place(content_container, this.container);
            construct.place(notification_mgs, content_container);
            construct.place(notification_data_container, content_container);
            construct.place(notification_date, notification_data_container);
            construct.place(notification_time, notification_data_container);

            this._register_listeners();
        },

        _register_listeners: function() {
            on(this.container, 'click', lang.hitch(this, function() {
                if(domClass.contains(this.container, 'unread')) {
                    domClass.remove(this.container, 'unread');
                    //TODO: emit read
                }
                else {
                    domClass.add(this.container, 'unread');
                    // TODO: emit unread
                }

            }));
        },

        _set_text: function(text) {

        },

        _set_read: function() {

        },

        _set_all_read: function() {


        },

        constructor: function(spec) {
            declare.safeMixin(this, spec);
        }

    });
});
