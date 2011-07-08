/*jsl:import ipa.js */

/*  Authors:
 *    Endi S. Dewata <edewata@redhat.com>
 *
 * Copyright (C) 2010 Red Hat
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

/* REQUIRES: ipa.js, details.js, search.js, add.js, entity.js */


IPA.entitle = {};

IPA.entitle.unregistered = 'unregistered';
IPA.entitle.online = 'online';
IPA.entitle.offline = 'offline';

IPA.entity_factories.entitle = function() {

    var builder = IPA.entity_builder();

    builder.
        entity({
            factory: IPA.entitle.entity,
            name: 'entitle'
        }).
        facet_groups([
            { name: 'account', label: IPA.messages.objects.entitle.account },
            { name: 'certificates', label: IPA.messages.objects.entitle.certificates }
        ]).
        details_facet({
            factory: IPA.entitle.details_facet,
            label: IPA.messages.objects.entitle.account,
            facet_group: 'account',
            sections: [
                {
                    name: 'general',
                    label: IPA.messages.details.general,
                    fields: [
                        {
                            name: 'uuid',
                            label: IPA.get_method_option('entitle_register', 'ipaentitlementid').label,
                            read_only: true
                        },
                        {
                            factory: IPA.entitle.download_widget,
                            name: 'certificate',
                            label: IPA.messages.objects.entitle.certificate
                        }
                    ]
                },
                {
                    name: 'status',
                    label: IPA.messages.objects.entitle.status,
                    fields: [
                        {
                            name: 'product',
                            label: IPA.messages.objects.entitle.product,
                            read_only: true
                        },
                        {
                            name: 'quantity',
                            label: IPA.get_method_arg('entitle_consume', 'quantity').label,
                            read_only: true
                        },
                        {
                            name: 'consumed',
                            label: IPA.messages.objects.entitle.consumed,
                            read_only: true
                        }
                    ]
                }
            ]
        }).
        search_facet({
            factory: IPA.entitle.search_facet,
            name: 'certificates',
            label: IPA.messages.objects.entitle.certificates,
            facet_group: 'certificates',
            columns: [
                {
                    name: 'product',
                    label: IPA.messages.objects.entitle.product
                },
                {
                    name: 'quantity',
                    label: IPA.get_method_arg('entitle_consume', 'quantity').label
                },
                {
                    name: 'start',
                    label: IPA.messages.objects.entitle.start
                },
                {
                    name: 'end',
                    label: IPA.messages.objects.entitle.end
                },
                {
                    factory: IPA.entitle.certificate_column,
                    name: 'certificate',
                    label: IPA.messages.objects.entitle.certificate
                }
            ]
        }).
        standard_association_facets().
        dialog({
            factory: IPA.entitle.register_online_dialog,
            name: 'online_registration',
            title: IPA.messages.objects.entitle.registration,
            fields: [
                {
                    name: 'username',
                    label: IPA.get_method_arg('entitle_register', 'username').label,
                    undo: false
                },
                {
                    name: 'password',
                    label: IPA.get_method_option('entitle_register', 'password').label,
                    type: 'password',
                    undo: false
                },
                {
                    name: 'ipaentitlementid',
                    label: IPA.get_method_option('entitle_register', 'ipaentitlementid').label,
                    undo: false
                }
            ]
        }).
        dialog({
            factory: IPA.entitle.register_offline_dialog,
            name: 'offline_registration',
            title: IPA.messages.objects.entitle.import_certificate,
            message: IPA.messages.objects.entitle.import_message,
            fields: [
                {
                    name: 'certificate',
                    label: IPA.messages.objects.entitle.certificate,
                    undo: false
                }
            ]
        }).
        dialog({
            factory: IPA.entitle.consume_dialog,
            name: 'consume',
            title: IPA.messages.objects.entitle.consume_entitlement,
            fields: [
                {
                    name: 'quantity',
                    label: IPA.get_method_arg('entitle_consume', 'quantity').label,
                    undo: false,
                    metadata: IPA.get_method_arg('entitle_consume', 'quantity')
                }
            ]
        }).
        dialog({
            factory: IPA.entitle.import_dialog,
            name: 'import',
            title: IPA.messages.objects.entitle.import_certificate,
            message: IPA.messages.objects.entitle.import_message,
            fields: [
                {
                    name: 'certificate',
                    label: IPA.messages.objects.entitle.certificate,
                    undo: false
                }
            ]
        });

    return builder.build();
};

IPA.entitle.entity = function(spec) {

    spec = spec || {};

    var that = IPA.entity(spec);

    that.status = IPA.entitle.unregistered;

    that.get_accounts = function(on_success, on_error) {

        var command = IPA.command({
            name: 'entitle_find_'+that.status,
            entity: 'entitle',
            method: 'find',
            options: { all: true },
            on_success: on_success,
            on_error: on_error
        });

        command.execute();
    };

    that.get_status = function(on_success, on_error) {

        var command = IPA.command({
            name: 'entitle_status_'+that.status,
            entity: 'entitle',
            method: 'status',
            on_success: function(data, text_status, xhr) {
                if (data.result.result.uuid == 'IMPORTED') {
                    that.status = IPA.entitle.offline;
                } else {
                    that.status = IPA.entitle.online;
                }

                if (on_success) {
                    on_success.call(this, data, text_status, xhr);
                }
            },
            on_error: function(xhr, text_status, error_thrown) {
                that.status = IPA.entitle.unregistered;

                if (on_error) {
                    on_error.call(this, xhr, text_status, error_thrown);
                }
            },
            retry: false
        });

        command.execute();
    };

    that.get_certificates = function(on_success, on_error) {

        var command = IPA.command({
            entity: 'entitle',
            method: 'get',
            on_success: on_success,
            on_error: on_error,
            retry: false
        });

        command.execute();
    };

    that.register_online = function(username, password, ipaentitlementid, on_success, on_error) {

        var command = IPA.command({
            entity: 'entitle',
            method: 'register',
            args: [ username ],
            options: {
                password: password,
                ipaentitlementid: ipaentitlementid
            },
            on_success: function(data, text_status, xhr) {
                that.status = IPA.entitle.online;
                if (on_success) {
                    on_success.call(this, data, text_status, xhr);
                }
            },
            on_error: on_error
        });

        command.execute();
    };

    that.register_offline = function(certificate, on_success, on_error) {

        var command = IPA.command({
            entity: 'entitle',
            method: 'import',
            args: [ certificate ],
            on_success: function(data, text_status, xhr) {
                that.status = IPA.entitle.offline;
                if (on_success) {
                    on_success.call(this, data, text_status, xhr);
                }
            },
            on_error: on_error
        });

        command.execute();
    };

    that.consume = function(quantity, on_success, on_error) {

        var command = IPA.command({
            entity: 'entitle',
            method: 'consume',
            args: [ quantity ],
            on_success: on_success,
            on_error: on_error
        });

        command.execute();
    };

    that.import_certificate = function(certificate, on_success, on_error) {

        var command = IPA.command({
            entity: 'entitle',
            method: 'import',
            args: [ certificate ],
            on_success: function(data, text_status, xhr) {
                that.status = IPA.entitle.offline;
                if (on_success) {
                    on_success.call(this, data, text_status, xhr);
                }
            },
            on_error: on_error
        });

        command.execute();
    };

    return that;
};

IPA.entitle.details_facet = function(spec) {

    spec = spec || {};
    spec.disable_breadcrumb = true;

    var that = IPA.details_facet(spec);

    that.create_controls = function() {

        that.register_buttons = $('<span/>', {
            name: 'register_buttons'
        }).appendTo(that.controls);

        that.register_online_button = IPA.action_button({
            name: 'register',
            label: IPA.messages.objects.entitle.register,
            icon: 'ui-icon-plus',
            click: function() {
                var dialog = that.entity.get_dialog('online_registration');
                dialog.open(that.container);
                return false;
            }
        }).appendTo(that.register_buttons);

        that.register_online_button.css('display', 'none');
/*
        that.register_offline_button = IPA.action_button({
            name: 'import',
            label: IPA.messages.objects.entitle.import,
            icon: 'ui-icon-plus',
            click: function() {
                var dialog = that.entity.get_dialog('offline_registration');
                dialog.open(that.container);
                return false;
            }
        }).appendTo(that.register_buttons);

        that.register_offline_button.css('display', 'none');
*/
    };

    that.refresh = function() {

        var summary = $('span[name=summary]', that.container).empty();
        summary.append(IPA.messages.objects.entitle.loading);

        function on_success(data, text_status, xhr) {
            if (that.entity.status == IPA.entitle.unregistered) {
                that.register_online_button.css('display', 'inline');
                // that.register_offline_button.css('display', 'inline');

            } else {
                that.register_online_button.css('display', 'none');
                // that.register_offline_button.css('display', 'none');
            }

            that.load(data.result.result);

            summary.empty();
        }

        function on_error(xhr, text_status, error_thrown) {

            that.register_online_button.css('display', 'inline');
            // that.register_offline_button.css('display', 'inline');

            var result = {
                uuid: '',
                product: '',
                quantity: 0,
                consumed: 0
            };
            that.load(result);

            summary.empty();
            summary.append(error_thrown.name+': '+error_thrown.message);
        }

        that.entity.get_status(
            on_success,
            on_error);
    };

    return that;
};

IPA.entitle.search_facet = function(spec) {

    spec = spec || {};
    spec.disable_facet_tabs = false;
    spec.selectable = false;

    var that = IPA.search_facet(spec);

    that.create_header = function(container) {

        that.facet_create_header(container);

        that.consume_buttons = $('<span/>', {
            name: 'consume_buttons'
        }).appendTo(that.controls);

        that.consume_button = IPA.action_button({
            name: 'consume',
            label: IPA.messages.objects.entitle.consume,
            icon: 'ui-icon-plus',
            click: function() {
                var dialog = that.entity.get_dialog('consume');
                dialog.open(that.container);
                return false;
            }
        }).appendTo(that.consume_buttons);

        that.consume_button.css('display', 'none');

        that.import_button = IPA.action_button({
            name: 'import',
            label: IPA.messages.objects.entitle.import_button,
            icon: 'ui-icon-plus',
            click: function() {
                var dialog = that.entity.get_dialog('import');
                dialog.open(that.container);
                return false;
            }
        }).appendTo(that.consume_buttons);

        that.import_button.css('display', 'none');
    };

    that.refresh = function() {

        function on_success(data, text_status, xhr) {

            if (that.entity.status == IPA.entitle.online) {
                that.consume_button.css('display', 'inline');
                that.import_button.css('display', 'none');

            } else if (that.entity.status == IPA.entitle.offline) {
                that.consume_button.css('display', 'none');
                that.import_button.css('display', 'inline');

            } else {
                that.consume_button.css('display', 'none');
                that.import_button.css('display', 'inline');
            }

            that.load(data.result.result);

            var summary = $('span[name=summary]', that.table.tfoot).empty();
            if (data.result.truncated) {
                var message = IPA.messages.search.truncated;
                message = message.replace('${counter}', data.result.count);
                summary.text(message);
            } else {
                summary.text(data.result.summary);
            }
        }

        function on_error(xhr, text_status, error_thrown) {

            that.consume_button.css('display', 'none');
            that.import_button.css('display', 'inline');

            var summary = $('span[name=summary]', that.table.tfoot).empty();
            summary.append(error_thrown.name+': '+error_thrown.message);
        }

        that.entity.get_status(
            function(data, text_status, xhr) {
                that.entity.get_certificates(
                    on_success,
                    on_error);
            },
            on_error);
    };

    return that;
};

IPA.entitle.certificate_column = function(spec) {

    spec = spec || {};

    var that = IPA.column(spec);

    that.setup = function(container, record) {

        container.empty();

        var certificate = record[that.name];

        $('<a/>', {
            'href': '#download',
            'html': IPA.messages.objects.entitle.download,
            'click': function() {
                var dialog = IPA.cert.download_dialog({
                    title: IPA.messages.objects.entitle.download_certificate,
                    certificate: certificate,
                    add_pem_delimiters: false
                });
                dialog.init();
                dialog.open();
                return false;
            }
        }).appendTo(container);
    };

    return that;
};

IPA.entitle.certificate_dialog = function(spec) {

    spec = spec || {};

    var that = IPA.dialog(spec);

    that.width = spec.width || 500;
    that.height = spec.height || 400;
    that.message = spec.message;
    that.label = spec.label;

    that.get_certificate = function() {
        var certificate = that.textarea.val();
        return IPA.cert.BEGIN_CERTIFICATE+'\n'+
            $.trim(certificate)+'\n'+
            IPA.cert.END_CERTIFICATE+'\n';
    };

    that.create = function() {
        that.container.append(that.message);
        that.container.append('<br/>');
        that.container.append('<br/>');

        that.container.append(IPA.cert.BEGIN_CERTIFICATE);
        that.container.append('<br/>');

        that.textarea = $('<textarea/>', {
            style: 'width: 100%; height: 225px;'
        }).appendTo(that.container);

        that.container.append('<br/>');
        that.container.append(IPA.cert.END_CERTIFICATE);
    };

    return that;
};

IPA.entitle.register_online_dialog = function(spec) {

    spec = spec || {};

    var that = IPA.dialog(spec);

    that.add_button(IPA.messages.objects.entitle.register, function() {
        var record = {};
        that.save(record);

        that.entity.register_online(
            record.username,
            record.password,
            record.ipaentitlementid,
            function() {
                var facet_name = IPA.current_facet(that.entity);
                var facet = that.entity.get_facet(facet_name);
                facet.refresh();
                that.close();
            }
        );
    });

    that.add_button(IPA.messages.buttons.cancel, function() {
        that.close();
    });

    return that;
};

IPA.entitle.register_offline_dialog = function(spec) {

    spec = spec || {};

    var that = IPA.entitle.certificate_dialog(spec);

    that.add_button(that.label, function() {
        that.entity.register_offline(
            that.get_certificate(),
            function() {
                var facet_name = IPA.current_facet(that.entity);
                var facet = that.entity.get_facet(facet_name);
                facet.refresh();
                that.close();
            }
        );
    });

    that.add_button(IPA.messages.buttons.cancel, function() {
        that.close();
    });

    return that;
};

IPA.entitle.consume_dialog = function(spec) {

    spec = spec || {};

    var that = IPA.dialog(spec);

    that.add_button(IPA.messages.objects.entitle.consume, function() {

        if (!that.is_valid()) {
            return;
        }

        var record = {};
        that.save(record);

        that.entity.consume(
            record.quantity,
            function() {
                var facet_name = IPA.current_facet(that.entity);
                var facet = that.entity.get_facet(facet_name);
                facet.refresh();
                that.close();
            }
        );
    });

    that.add_button(IPA.messages.buttons.cancel, function() {
        that.close();
    });

    return that;
};

IPA.entitle.import_dialog = function(spec) {

    spec = spec || {};

    var that = IPA.entitle.certificate_dialog(spec);

    that.add_button(IPA.messages.objects.entitle.import_button, function() {
        that.entity.import_certificate(
            that.get_certificate(),
            function() {
                var facet_name = IPA.current_facet(that.entity);
                var facet = that.entity.get_facet(facet_name);
                facet.refresh();
                that.close();
            }
        );
    });

    that.add_button(IPA.messages.buttons.cancel, function() {
        that.close();
    });

    return that;
};

IPA.entitle.download_widget = function(spec) {

    spec = spec || {};

    var that = IPA.widget(spec);

    that.create = function(container) {
        that.link = $('<a/>', {
            'href': '#download',
            'html': IPA.messages.objects.entitle.download,
            'click': function() {
                that.entity.get_accounts(
                    function(data, text_status, xhr) {
                        var userpkcs12 = data.result.result[0].userpkcs12;
                        if (!userpkcs12) {
                            alert(IPA.messages.objects.entitle.no_certificate);
                            return;
                        }

                        var dialog = IPA.cert.download_dialog({
                            title: IPA.messages.objects.entitle.download_certificate,
                            certificate: userpkcs12[0].__base64__,
                            add_pem_delimiters: false
                        });

                        dialog.init();
                        dialog.open();
                    }
                );
                return false;
            }
        }).appendTo(container);
    };

    that.update = function() {
        if (that.entity.status == IPA.entitle.online) {
            that.link.css('display', 'inline');
        } else {
            that.link.css('display', 'none');
        }
    };

    return that;
};
