/** @jsx createElement */

import {createElement, Phrase} from 'lacona-phrase'
import {expect} from 'chai'
import {text} from './_util'
import {TimeDuration} from '..'
import {Parser} from 'lacona'

describe('time-duration', () => {
	let parser

	describe('defaults', () => {

		beforeEach(() => {
			parser = new Parser()
			parser.grammar = <TimeDuration />
		})

		it('1 minute', () => {
			const data = parser.parseArray('1 minute')
			expect(data).to.have.length(2)
			expect(text(data[0])).to.equal('1 minute')
			expect(data[0].result).to.eql({minutes: 1})
		})

		it('x minutes', () => {
			const data = parser.parseArray('3 minutes')
			expect(data).to.have.length(2)
			expect(text(data[0])).to.equal('3 minutes')
			expect(data[0].result).to.eql({minutes: 3})
		})

		it('x hours and 1 minute', () => {
			const data = parser.parseArray('3 hours and 1 minute')
			expect(data).to.have.length(2)
			expect(text(data[0])).to.equal('3 hours and 1 minute')
			expect(data[0].result).to.eql({hours: 3, minutes: 1})
		})

		it('1 hour, x minutes, and x seconds', () => {
			const data = parser.parseArray('1 hour, 2 minutes, and 3 seconds')
			expect(data).to.have.length(2)
			expect(text(data[0])).to.equal('1 hour, 2 minutes, and 3 seconds')
			expect(data[0].result).to.eql({hours: 1, minutes: 2, seconds: 3})
		})

		it('x minutes and x minutes', () => {
			const data = parser.parseArray('2 minutes and 3 minutes')
			expect(data).to.have.length(0)
		})
	})

	describe('seconds={false}', () => {

		beforeEach(() => {
			parser = new Parser()
			parser.grammar = <TimeDuration seconds={false} />
		})

		it('1 minute', () => {
			const data = parser.parseArray('1 minute')
			expect(data).to.have.length(2)
			expect(text(data[0])).to.equal('1 minute')
			expect(data[0].result).to.eql({minutes: 1})
		})

		it('1 second', () => {
			const data = parser.parseArray('1 second')
			expect(data).to.have.length(0)
		})

		it('3 minutes and 42 seconds', () => {
			const data = parser.parseArray('3 minutes and 42 seconds')
			expect(data).to.have.length(0)
		})
	})
})
