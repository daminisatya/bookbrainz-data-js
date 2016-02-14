/*
 * Copyright (C) 2015-2016  Ben Ockmore
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

'use strict';

const util = require('../../util');

module.exports = (bookshelf) => {
	const WorkRevision = bookshelf.Model.extend({
		tableName: 'bookbrainz.work_revision',
		idAttribute: 'id',
		parse: util.snakeToCamel,
		format: util.camelToSnake,
		revision() {
			return this.belongsTo('Revision', 'id');
		},
		entity() {
			return this.belongsTo('WorkHeader', 'bbid');
		},
		data() {
			return this.belongsTo('WorkData', 'data_id');
		},
		diff(other) {
			return util.diffRevisions(this, other, [
				'annotation', 'disambiguation', 'aliasSet', 'identifierSet',
				'relationshipSet'
			]);
		},
		parent() {
			return this.related('revision').fetch()
				.then((revision) =>
					revision.related('parents').fetch()
				)
				.then((parents) =>
					parents.map((parent) => parent.get('id'))
				)
				.then((parentIds) => {
					if (parentIds.length === 0) {
						return null;
					}

					return new WorkRevision({bbid: this.get('bbid')})
						.query('whereIn', 'id', parentIds)
						.fetch();
				});
		}
	});

	return bookshelf.model('WorkRevision', WorkRevision);
};